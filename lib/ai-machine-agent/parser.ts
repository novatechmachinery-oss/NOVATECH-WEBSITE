import type { AgentSearchContext, MachineSearchIntent, NumericSearchCriterion } from "@/lib/ai-machine-agent/types";

const fieldAliases: Record<string, string[]> = {
  x: ["x", "x axis", "x-axis", "x travel", "x-axis travel", "travel x"],
  y: ["y", "y axis", "y-axis", "y travel", "y-axis travel", "travel y"],
  z: ["z", "z axis", "z-axis", "z travel", "z-axis travel", "travel z"],
  diameter: ["dia", "diameter", "turning dia", "turning diameter", "pitch diameter"],
  spindle: ["spindle", "spindle dia", "spindle diameter", "spindle speed"],
  table: ["table", "table size", "table diameter", "rotary table", "clamping surface"],
  height: ["height", "working height", "under crossbar"],
  width: ["width", "face width"],
  length: ["length", "distance", "between centers", "centre distance", "center distance"],
  rpm: ["rpm", "speed", "spindle speed", "cutter speed"],
  feed: ["feed", "feeds", "rapid feed", "rapid traverse"],
  taper: ["taper", "tool holder", "holder"],
  control: ["control", "cnc control", "controller"],
  weight: ["weight", "kg", "ton"],
  capacity: ["capacity"],
  model: ["model"],
  brand: ["brand", "make", "manufacturer"],
  year: ["year"],
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "any",
  "around",
  "aas",
  "paas",
  "between",
  "chahiye",
  "for",
  "ke",
  "ki",
  "ka",
  "me",
  "mm",
  "near",
  "of",
  "one",
  "please",
  "se",
  "show",
  "tak",
  "the",
  "to",
  "upar",
  "with",
]);

const fieldTermStopWords = new Set(
  Object.values(fieldAliases)
    .flat()
    .flatMap((alias) => alias.split(/\s+/))
    .filter((word) => word.length <= 8),
);

function normalizeQuery(value: string) {
  return value
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNumber(value: string) {
  const cleaned = value.replace(/,/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function canonicalFieldHint(value: string) {
  const normalized = value.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;

  for (const [field, aliases] of Object.entries(fieldAliases)) {
    if (field === "x" || field === "y" || field === "z") {
      if (aliases.some((alias) => new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`).test(normalized))) {
        return field;
      }
      continue;
    }

    if (aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
      return field;
    }
  }

  return undefined;
}

function fieldHintNear(text: string, start: number, end: number) {
  const before = text.slice(Math.max(0, start - 44), start);
  const after = text.slice(end, Math.min(text.length, end + 34));
  const beforeMatch = before.match(/([a-z][a-z\s/-]{0,30})$/i);
  const afterMatch = after.match(/^(\s*[a-z][a-z\s/-]{0,24})/i);
  const beforeHint = beforeMatch ? canonicalFieldHint(beforeMatch[1]) : undefined;
  const afterHint = afterMatch ? canonicalFieldHint(afterMatch[1]) : undefined;
  return beforeHint ?? afterHint;
}

function pushUniqueCriterion(items: NumericSearchCriterion[], next: NumericSearchCriterion) {
  const key = `${next.fieldHint ?? ""}:${next.value ?? ""}:${next.min ?? ""}:${next.max ?? ""}`;
  if (!items.some((item) => `${item.fieldHint ?? ""}:${item.value ?? ""}:${item.min ?? ""}:${item.max ?? ""}` === key)) {
    items.push(next);
  }
}

function extractNumericCriteria(query: string, context?: AgentSearchContext) {
  const criteria: NumericSearchCriterion[] = [];
  const consumed: Array<[number, number]> = [];
  const rangePattern =
    /(?:([a-z][a-z\s/-]{0,28})\s+)?(\d[\d,]*(?:\.\d+)?)\s*(?:-|to|se|and|से)\s*(\d[\d,]*(?:\.\d+)?)(?:\s*(?:mm|rpm|kg|ton|tons|inch|inches|"))?/gi;

  for (const match of query.matchAll(rangePattern)) {
    const min = normalizeNumber(match[2] ?? "");
    const max = normalizeNumber(match[3] ?? "");
    if (min === null || max === null) continue;

    const fieldHint = canonicalFieldHint(match[1] ?? "") ?? fieldHintNear(query, match.index ?? 0, (match.index ?? 0) + match[0].length);
    pushUniqueCriterion(criteria, {
      raw: match[0],
      fieldHint: fieldHint ?? context?.lastFieldHint,
      min: Math.min(min, max),
      max: Math.max(min, max),
      approximate: false,
    });
    consumed.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
  }

  const valuePattern =
    /(?:([a-z][a-z\s/-]{0,28})\s+)?(around|near|approx|approximately|aas paas|ke aas paas|ke around)?\s*(\d[\d,]*(?:\.\d+)?)(?:\s*(?:mm|rpm|kg|ton|tons|inch|inches|"))?(?:\s*(ke aas paas|ke around|aas paas|around|near|tak|se upar))?/gi;

  for (const match of query.matchAll(valuePattern)) {
    const index = match.index ?? 0;
    const end = index + match[0].length;
    if (consumed.some(([from, to]) => index >= from && end <= to)) continue;

    const value = normalizeNumber(match[3] ?? "");
    if (value === null) continue;

    const capturedField = match[1] ?? "";
    const capturedModifier = /^(around|near|approx|approximately|aas paas|ke aas paas|ke around)$/i.test(capturedField.trim())
      ? capturedField
      : match[2];
    const fieldSource = capturedModifier === capturedField ? "" : capturedField;
    const modifier = [capturedModifier, match[4]].filter(Boolean).join(" ");
    const fieldHint = canonicalFieldHint(fieldSource) ?? fieldHintNear(query, index, end) ?? context?.lastFieldHint;
    const approximate = /around|near|aas paas|approx/i.test(modifier);
    const tail = match[4] ?? "";

    if (/tak/i.test(tail)) {
      pushUniqueCriterion(criteria, { raw: match[0], fieldHint, max: value, approximate: true });
    } else if (/upar/i.test(tail)) {
      pushUniqueCriterion(criteria, { raw: match[0], fieldHint, min: value, approximate: true });
    } else {
      pushUniqueCriterion(criteria, { raw: match[0], fieldHint, value, approximate });
    }
  }

  return criteria;
}

function stripNumericLanguage(query: string) {
  return query
    .replace(/\d[\d,]*(?:\.\d+)?/g, " ")
    .replace(/\b(?:mm|rpm|kg|ton|tons|inch|inches|around|near|approx|approximately|aas|paas|ke|to|between|se|tak|upar)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTerms(query: string) {
  const cleaned = stripNumericLanguage(query);
  const words = cleaned
    .split(/[^a-z0-9]+/i)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 1 && !stopWords.has(word) && !fieldTermStopWords.has(word));

  const deduped = Array.from(new Set(words));
  const phraseTerms = Array.from(
    new Set(
      cleaned
        .split(/\s{2,}|,/)
        .map((item) =>
          item
            .split(/\s+/)
            .filter((word) => !fieldTermStopWords.has(word))
            .join(" ")
            .trim(),
        )
        .filter((item) => item.length > 2),
    ),
  );

  return { textTerms: deduped, phraseTerms };
}

export function parseMachineSearchIntent(query: string, context?: AgentSearchContext): MachineSearchIntent {
  const normalizedQuery = normalizeQuery(query);
  const wantsMore = /\b(show|give|more|next)\b.*\b(\d+|more)?\b/i.test(normalizedQuery) && /\bmore|next\b/i.test(normalizedQuery);
  const wantsBigger = /\b(bigger|larger|large|higher|upar|zyada|more)\b/i.test(normalizedQuery) && !wantsMore;
  const explicitLimit = normalizedQuery.match(/\b(?:show|give)\s+(\d+)\s*(?:more|machines|results)?\b|\b(\d+)\s+more\b/i);
  const explicitLimitValue = explicitLimit ? Number(explicitLimit[1] ?? explicitLimit[2]) : null;
  const limit = explicitLimitValue ? Math.min(Math.max(explicitLimitValue, 1), 8) : 5;

  if (wantsMore && context) {
    return {
      query,
      normalizedQuery,
      textTerms: context.textTerms ?? [],
      phraseTerms: context.phraseTerms ?? [],
      numericCriteria: context.numericCriteria ?? [],
      wantsMore,
      wantsBigger: false,
      limit,
    };
  }

  const numericCriteria = extractNumericCriteria(normalizedQuery, context);
  const { textTerms, phraseTerms } = extractTerms(normalizedQuery);
  const mergedTextTerms = wantsBigger && context?.textTerms?.length ? context.textTerms : textTerms;
  const mergedPhraseTerms = wantsBigger && context?.phraseTerms?.length ? context.phraseTerms : phraseTerms;
  const mergedNumericCriteria =
    numericCriteria.length > 0 ? numericCriteria : wantsBigger ? context?.numericCriteria ?? [] : [];

  return {
    query,
    normalizedQuery,
    textTerms: mergedTextTerms,
    phraseTerms: mergedPhraseTerms,
    numericCriteria: mergedNumericCriteria,
    wantsMore,
    wantsBigger,
    limit,
  };
}

export function shouldAskForNumericClarification(intent: MachineSearchIntent, context?: AgentSearchContext) {
  return (
    intent.numericCriteria.length === 1 &&
    intent.textTerms.length === 0 &&
    intent.phraseTerms.length === 0 &&
    !intent.numericCriteria[0].fieldHint &&
    !intent.numericCriteria[0].approximate &&
    typeof intent.numericCriteria[0].min !== "number" &&
    typeof intent.numericCriteria[0].max !== "number" &&
    !context?.lastFieldHint
  );
}
