import type { AgentLanguage, AgentMachineResult } from "@/lib/ai-machine-agent/types";

const copy = {
  english: {
    clarification: "Which specification is this value for?",
    empty: "Please type a machine name or specification.",
    noResults:
      "I couldn’t find a matching machine in the current inventory. Share the machine type, brand, model, or key specification and I’ll check again.",
    exactPrefix: "I found",
    closePrefix: "Exact match not found. Closest machines:",
    foundSuffix: "match",
    foundSuffixPlural: "matches",
    error: "Sorry, search is not available right now. Please try again.",
  },
  hindi: {
    clarification: "Ye value kis specification ke liye hai?",
    empty: "Machine name ya specification type karein.",
    noResults:
      "Current inventory mein exact match nahi mila. Machine type, brand, model ya key specification share karein—main dobara check kar deta hoon.",
    exactPrefix: "Mujhe",
    closePrefix: "Exact match nahi mila. Ye closest machines hain:",
    foundSuffix: "match mila",
    foundSuffixPlural: "matches mile",
    error: "Sorry, search abhi complete nahi ho pa rahi. Please try again.",
  },
  punjabi: {
    clarification: "Eh value kis specification lai hai?",
    empty: "Machine name ya specification type karo.",
    noResults: "Relevant machine nahi mili. Hor machine type ya specification try karo.",
    exactPrefix: "Mainu",
    closePrefix: "Exact match nahi mili. Eh closest machines han:",
    foundSuffix: "match mili",
    foundSuffixPlural: "matches milian",
    error: "Sorry, search hun complete nahi ho rahi. Please try again.",
  },
  tamil: {
    clarification: "இந்த value எந்த specification காக?",
    empty: "Machine name அல்லது specification type செய்யவும்.",
    noResults: "Relevant machine கிடைக்கவில்லை. வேறு type அல்லது specification try செய்யவும்.",
    exactPrefix: "நான்",
    closePrefix: "Exact match கிடைக்கவில்லை. அருகிலுள்ள machines:",
    foundSuffix: "match கண்டேன்",
    foundSuffixPlural: "matches கண்டேன்",
    error: "Sorry, search இப்போது முடியவில்லை. Please try again.",
  },
  marathi: {
    clarification: "Hi value kontya specification sathi aahe?",
    empty: "Machine name kiwa specification type kara.",
    noResults: "Relevant machine milali nahi. Dusra type kiwa specification try kara.",
    exactPrefix: "Mala",
    closePrefix: "Exact match milala nahi. He closest machines aahet:",
    foundSuffix: "match milala",
    foundSuffixPlural: "matches milale",
    error: "Sorry, search atta complete hot nahi. Please try again.",
  },
  bengali: {
    clarification: "Ei value kon specification er jonno?",
    empty: "Machine name ba specification type korun.",
    noResults: "Relevant machine pawa jayni. Onno type ba specification try korun.",
    exactPrefix: "Ami",
    closePrefix: "Exact match pawa jayni. Ei closest machines:",
    foundSuffix: "match peyechi",
    foundSuffixPlural: "matches peyechi",
    error: "Sorry, search ekhon complete hochhe na. Please try again.",
  },
} satisfies Record<AgentLanguage, Record<string, string>>;

export function getAgentCopy(language: AgentLanguage) {
  return copy[language] ?? copy.english;
}

export function buildSearchMessage(
  language: AgentLanguage,
  results: AgentMachineResult[],
  hasExact: boolean,
  exactCount = 0,
  closeCount = 0,
) {
  const labels = getAgentCopy(language);

  if (results.length === 0) return labels.noResults;
  if (!hasExact) {
    return `${labels.closePrefix} ${results.length} relevant option${results.length === 1 ? "" : "s"} found.`;
  }

  const suffix = exactCount === 1 ? labels.foundSuffix : labels.foundSuffixPlural;
  const closeNote = closeCount > 0 ? ` ${closeCount} close alternative${closeCount === 1 ? " is" : "s are"} also listed below.` : "";
  return `${labels.exactPrefix} ${exactCount} ${suffix}.${closeNote}`;
}
