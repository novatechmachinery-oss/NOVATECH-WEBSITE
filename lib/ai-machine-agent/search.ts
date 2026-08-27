import type { MachineItem } from "@/lib/machines";
import { getMachinePath } from "@/lib/machine-urls";
import type {
  AgentMachineResult,
  AgentSearchContext,
  MachineSearchIntent,
  NumericSearchCriterion,
  RankedMachine,
  RelevantSpec,
} from "@/lib/ai-machine-agent/types";

const maxCandidateResults = 60;
const textIntentMinimumScore = 54;
const numericIntentMinimumScore = 34;
const mixedIntentMinimumScore = 78;

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberValues(value: string) {
  const matches = value.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  return matches
    .map((item) => Number(item.replace(/,/g, "")))
    .filter((item) => Number.isFinite(item));
}

function specText(spec: RelevantSpec) {
  return normalizeText(`${spec.label} ${spec.value}`);
}

function words(value: string) {
  return value.split(" ").filter(Boolean);
}

function hasWord(value: string, term: string) {
  return words(value).includes(term);
}

function hasTerm(value: string, term: string) {
  if (term.length <= 3) return hasWord(value, term);
  return words(value).some((word) => word === term || word.startsWith(term));
}

function hasPhrase(value: string, phrase: string) {
  const phraseWords = words(phrase);
  if (phraseWords.length === 0) return false;
  if (phraseWords.length === 1) return hasTerm(value, phraseWords[0]);
  return value.includes(phraseWords.join(" "));
}

function machineSearchText(machine: MachineItem) {
  return normalizeText(
    [
      machine.title,
      machine.category,
      machine.subcategory,
      machine.manufacturer,
      machine.model,
      machine.machineType,
      machine.description,
      ...(machine.specifications ?? []).flatMap((spec) => [spec.label, spec.value]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function importantSpecs(machine: MachineItem) {
  const specs = machine.specifications ?? [];
  const selected: RelevantSpec[] = [];

  for (const label of ["Model", "Manufacturer", "Brand", "Control", "Condition", "Machine Type"]) {
    const match = specs.find((spec) => spec.label.toLowerCase() === label.toLowerCase());
    if (match && !selected.some((item) => item.label === match.label)) {
      selected.push(match);
    }
  }

  if (machine.model && !selected.some((item) => item.label.toLowerCase() === "model")) {
    selected.unshift({ label: "Model", value: machine.model });
  }

  if (machine.manufacturer && !selected.some((item) => /brand|manufacturer/i.test(item.label))) {
    selected.unshift({ label: "Brand", value: machine.manufacturer });
  }

  return selected.slice(0, 3);
}

function labelMatchesHint(label: string, hint?: string) {
  if (!hint) return true;

  const normalizedLabel = normalizeText(label);
  const normalizedHint = normalizeText(hint);
  if (!normalizedHint) return true;

  if (normalizedHint === "x" || normalizedHint === "y" || normalizedHint === "z") {
    return (
      new RegExp(`\\b${normalizedHint}\\b`).test(normalizedLabel) ||
      normalizedLabel.includes(`${normalizedHint} axis`) ||
      normalizedLabel.includes(`travel ${normalizedHint}`) ||
      normalizedLabel.includes(`range ${normalizedHint}`)
    );
  }

  if (normalizedHint === "diameter") {
    return /\b(dia|diameter)\b/.test(normalizedLabel);
  }

  if (normalizedHint === "rpm") {
    return /\b(rpm|speed)\b/.test(normalizedLabel);
  }

  return normalizedHint.split(" ").every((part) => normalizedLabel.includes(part));
}

function chooseAxisValue(label: string, values: number[], hint?: string) {
  if (!hint || values.length < 3) return values;

  const normalizedLabel = normalizeText(label);
  if (!/\bx\b/.test(normalizedLabel) || !/\by\b/.test(normalizedLabel) || !/\bz\b/.test(normalizedLabel)) {
    return values;
  }

  if (hint === "x") return [values[0]];
  if (hint === "y") return [values[1]];
  if (hint === "z") return [values[2]];
  return values;
}

function toleranceFor(value: number, approximate: boolean) {
  const percent = approximate ? 0.2 : 0.12;
  return Math.max(value * percent, value <= 100 ? 10 : 50);
}

function scoreNumberMatch(value: number, criterion: NumericSearchCriterion) {
  if (typeof criterion.value === "number") {
    const diff = Math.abs(value - criterion.value);
    if (diff === 0) return { score: 80, exact: true, diff };
    const tolerance = toleranceFor(criterion.value, criterion.approximate);
    if (diff <= tolerance) {
      return { score: Math.max(22, 68 - (diff / tolerance) * 34), exact: false, diff };
    }
    return { score: Math.max(0, 18 - (diff / Math.max(tolerance, 1)) * 6), exact: false, diff };
  }

  if (typeof criterion.min === "number" && typeof criterion.max === "number") {
    if (value >= criterion.min && value <= criterion.max) {
      return { score: 72, exact: true, diff: 0 };
    }
    const diff = value < criterion.min ? criterion.min - value : value - criterion.max;
    const tolerance = toleranceFor((criterion.min + criterion.max) / 2, true);
    return { score: diff <= tolerance ? Math.max(16, 50 - (diff / tolerance) * 28) : 0, exact: false, diff };
  }

  if (typeof criterion.min === "number") {
    const diff = value >= criterion.min ? 0 : criterion.min - value;
    return { score: value >= criterion.min ? 58 : Math.max(0, 20 - diff / 10), exact: value >= criterion.min, diff };
  }

  if (typeof criterion.max === "number") {
    const diff = value <= criterion.max ? 0 : value - criterion.max;
    return { score: value <= criterion.max ? 58 : Math.max(0, 20 - diff / 10), exact: value <= criterion.max, diff };
  }

  return { score: 0, exact: false, diff: Number.POSITIVE_INFINITY };
}

function scoreNumericCriterion(machine: MachineItem, criterion: NumericSearchCriterion, allowBroadNumeric: boolean) {
  const specs = machine.specifications ?? [];
  let bestScore = 0;
  let bestExact = false;
  let bestSpec: RelevantSpec | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const spec of specs) {
    if (!labelMatchesHint(spec.label, criterion.fieldHint)) continue;

    const values = chooseAxisValue(spec.label, numberValues(spec.value), criterion.fieldHint);
    for (const value of values) {
      const match = scoreNumberMatch(value, criterion);
      const score = criterion.fieldHint && match.score > 0
        ? match.score + 18
        : allowBroadNumeric
          ? match.score
          : Math.min(match.score, 18);
      if (score > bestScore || (score === bestScore && match.diff < bestDiff)) {
        bestScore = score;
        bestExact = Boolean(criterion.fieldHint && match.exact);
        bestSpec = spec;
        bestDiff = match.diff;
      }
    }
  }

  if (!bestSpec && !criterion.fieldHint) {
    const summaryValues = [
      ["Ref. No.", machine.referenceNumber ? String(machine.referenceNumber) : ""],
      ["Model", machine.model ?? ""],
    ] satisfies Array<[string, string]>;

    for (const [label, rawValue] of summaryValues) {
      for (const value of numberValues(rawValue)) {
        const match = scoreNumberMatch(value, criterion);
        const score = allowBroadNumeric ? match.score : Math.min(match.score, 18);
        if (score > bestScore) {
          bestScore = score;
          bestExact = false;
          bestSpec = { label, value: rawValue };
          bestDiff = match.diff;
        }
      }
    }
  }

  return { score: bestScore, exact: bestExact, spec: bestSpec };
}

function scoreTextTerms(machine: MachineItem, intent: MachineSearchIntent) {
  const text = machineSearchText(machine);
  const title = normalizeText(machine.title);
  const category = normalizeText([machine.category, machine.subcategory, machine.machineType].filter(Boolean).join(" "));
  const brandModel = normalizeText([machine.manufacturer, machine.model].filter(Boolean).join(" "));
  let score = 0;
  const matchedSpecs: RelevantSpec[] = [];

  for (const phrase of intent.phraseTerms) {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) continue;
    if (hasPhrase(title, normalizedPhrase)) score += 70;
    else if (hasPhrase(category, normalizedPhrase)) score += 58;
    else if (hasPhrase(brandModel, normalizedPhrase)) score += 62;
    else if (hasPhrase(text, normalizedPhrase)) score += 28;
  }

  for (const term of intent.textTerms) {
    if (hasWord(title, term)) score += 34;
    else if (hasTerm(title, term)) score += 24;
    else if (hasTerm(category, term)) score += 30;
    else if (hasTerm(brandModel, term)) score += 32;
    else if (hasTerm(text, term)) score += 10;

    for (const spec of machine.specifications ?? []) {
      if (hasTerm(specText(spec), term) && !matchedSpecs.some((item) => item.label === spec.label && item.value === spec.value)) {
        matchedSpecs.push(spec);
      }
    }
  }

  return { score, matchedSpecs };
}

function rankMachine(machine: MachineItem, intent: MachineSearchIntent): RankedMachine | null {
  const textMatch = scoreTextTerms(machine, intent);
  const hasTextIntent = intent.textTerms.length > 0 || intent.phraseTerms.length > 0;

  if (hasTextIntent && textMatch.score <= 0) {
    return null;
  }

  let score = textMatch.score;
  let exact = textMatch.score >= 70;
  const relevantSpecs: RelevantSpec[] = [...textMatch.matchedSpecs];
  let numericMatches = 0;
  const allowBroadNumeric = !hasTextIntent;

  for (const criterion of intent.numericCriteria) {
    const match = scoreNumericCriterion(machine, criterion, allowBroadNumeric);
    score += match.score;
    if (match.score > 0) numericMatches += 1;
    if (match.exact) exact = true;
    if (match.spec && !relevantSpecs.some((item) => item.label === match.spec?.label && item.value === match.spec?.value)) {
      relevantSpecs.unshift(match.spec);
    }
  }

  if (intent.numericCriteria.length > 1 && numericMatches > 1) {
    score += numericMatches * 28;
  }

  if (intent.textTerms.length > 0 && intent.numericCriteria.length > 0 && textMatch.score > 0 && numericMatches > 0) {
    score += 36;
  }

  if (intent.wantsBigger && intent.numericCriteria.length > 0) {
    score += numericMatches > 0 ? 20 : 0;
  }

  if (score <= 0) return null;

  return {
    machine,
    score,
    exact,
    relevantSpecs: [...relevantSpecs, ...importantSpecs(machine)]
      .filter((spec, index, all) => all.findIndex((item) => item.label === spec.label && item.value === spec.value) === index)
      .slice(0, 5),
  };
}

function minimumScoreForIntent(intent: MachineSearchIntent) {
  const hasTextIntent = intent.textTerms.length > 0 || intent.phraseTerms.length > 0;
  const hasNumericIntent = intent.numericCriteria.length > 0;

  if (hasTextIntent && hasNumericIntent) return mixedIntentMinimumScore;
  if (hasNumericIntent) return numericIntentMinimumScore;
  return textIntentMinimumScore;
}

function filterRelevantResults(ranked: RankedMachine[], intent: MachineSearchIntent) {
  const minimumScore = minimumScoreForIntent(intent);
  const topScore = ranked[0]?.score ?? 0;
  const identifyingNameQuery =
    intent.textTerms.length >= 3 &&
    intent.numericCriteria.length > 0 &&
    intent.numericCriteria.every((criterion) => !criterion.fieldHint);
  const ratioFloor = identifyingNameQuery
    ? topScore * 0.68
    : topScore >= 150
      ? topScore * 0.34
      : minimumScore;

  return ranked.filter((item) => item.score >= minimumScore && item.score >= ratioFloor);
}

function machineToResult(ranked: RankedMachine): AgentMachineResult {
  const { machine } = ranked;
  return {
    id: machine.id,
    title: machine.title,
    url: getMachinePath(machine),
    manufacturer: machine.manufacturer,
    model: machine.model,
    category: machine.category,
    subcategory: machine.subcategory,
    referenceNumber: machine.referenceNumber,
    relevantSpecs: ranked.relevantSpecs,
    score: Math.round(ranked.score),
    exact: ranked.exact,
  };
}

export function searchMachines(machines: MachineItem[], intent: MachineSearchIntent, context?: AgentSearchContext) {
  const ranked = filterRelevantResults(machines
    .map((machine) => rankMachine(machine, intent))
    .filter((item): item is RankedMachine => item !== null)
    .sort((left, right) => {
      if (right.exact !== left.exact) return Number(right.exact) - Number(left.exact);
      return right.score - left.score;
    })
    .slice(0, maxCandidateResults), intent);

  const offset = intent.wantsMore ? context?.offset ?? 0 : 0;
  const results = ranked.slice(offset, offset + intent.limit).map(machineToResult);
  const numericWithHints = intent.numericCriteria.filter((criterion) => criterion.fieldHint);
  const lastFieldHint = numericWithHints.at(-1)?.fieldHint ?? context?.lastFieldHint;

  return {
    results,
    nextContext: {
      textTerms: intent.textTerms,
      phraseTerms: intent.phraseTerms,
      numericCriteria: intent.numericCriteria,
      lastFieldHint,
      offset: offset + results.length,
    } satisfies AgentSearchContext,
    total: ranked.length,
    hasExact: ranked.some((item) => item.exact),
  };
}
