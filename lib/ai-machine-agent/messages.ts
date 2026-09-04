import type { AgentLanguage, AgentMachineResult } from "@/lib/ai-machine-agent/types";

const copy = {
  english: {
    clarification: "Which specification is this value for?",
    empty: "Please type a machine name or specification.",
    noResults:
      "I could not find a matching machine in the current inventory. Share the machine type, brand, model, or key specification and I will check again.",
    exactSingle: "I found an exact match.",
    exactPlural: "I found exact matches.",
    similar: "Similar machines are listed below.",
    closePrefix: "Exact match not found. Closest relevant machines are listed below.",
    error: "Sorry, search is not available right now. Please try again.",
  },
  hindi: {
    clarification: "Ye value kis specification ke liye hai?",
    empty: "Machine name ya specification type karein.",
    noResults:
      "Current inventory mein matching machine nahi mili. Machine type, brand, model ya key specification share karein, main dobara check kar deta hoon.",
    exactSingle: "Mujhe ek exact match mila.",
    exactPlural: "Mujhe exact matches mile.",
    similar: "Similar machines neeche listed hain.",
    closePrefix: "Exact match nahi mila. Closest relevant machines neeche listed hain.",
    error: "Sorry, search abhi available nahi hai. Please try again.",
  },
  chinese: {
    clarification: "This value is for which specification?",
    empty: "Please enter a machine name or specification.",
    noResults: "No matching machine was found in the current inventory. Please share a machine type, brand, model, or key specification.",
    exactSingle: "I found an exact match.",
    exactPlural: "I found exact matches.",
    similar: "Similar machines are listed below.",
    closePrefix: "No exact match was found. The closest relevant machines are listed below.",
    error: "Sorry, search is not available right now. Please try again.",
  },
  punjabi: {
    clarification: "Eh value kis specification lai hai?",
    empty: "Machine name ya specification type karo.",
    noResults: "Current inventory vich matching machine nahi mili. Machine type, brand, model ya key specification share karo.",
    exactSingle: "Mainu ik exact match mili.",
    exactPlural: "Mainu exact matches milian.",
    similar: "Similar machines hethan listed han.",
    closePrefix: "Exact match nahi mili. Closest relevant machines hethan listed han.",
    error: "Sorry, search hun available nahi hai. Please try again.",
  },
  tamil: {
    clarification: "Indha value entha specification kaaga?",
    empty: "Machine name alladhu specification type seyyavum.",
    noResults: "Current inventory la matching machine kidaikkavillai. Machine type, brand, model illai key specification share seyyavum.",
    exactSingle: "Oru exact match kidaithathu.",
    exactPlural: "Exact matches kidaithana.",
    similar: "Similar machines keezhe listed irukku.",
    closePrefix: "Exact match kidaikkavillai. Closest relevant machines keezhe listed irukku.",
    error: "Sorry, search ippodhu available illai. Please try again.",
  },
  marathi: {
    clarification: "Hi value kontya specification sathi aahe?",
    empty: "Machine name kiwa specification type kara.",
    noResults: "Current inventory madhye matching machine milali nahi. Machine type, brand, model kiwa key specification share kara.",
    exactSingle: "Mala ek exact match milala.",
    exactPlural: "Mala exact matches milale.",
    similar: "Similar machines khali listed aahet.",
    closePrefix: "Exact match milala nahi. Closest relevant machines khali listed aahet.",
    error: "Sorry, search atta available nahi. Please try again.",
  },
  bengali: {
    clarification: "Ei value kon specification er jonno?",
    empty: "Machine name ba specification type korun.",
    noResults: "Current inventory te matching machine paowa jayni. Machine type, brand, model ba key specification share korun.",
    exactSingle: "Ami ekta exact match peyechi.",
    exactPlural: "Ami exact matches peyechi.",
    similar: "Similar machines niche listed ache.",
    closePrefix: "Exact match paowa jayni. Closest relevant machines niche listed ache.",
    error: "Sorry, search ekhon available noy. Please try again.",
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
  if (!hasExact) return labels.closePrefix;

  const exactLine = exactCount === 1 ? labels.exactSingle : labels.exactPlural;
  return closeCount > 0 ? `${exactLine} ${labels.similar}` : exactLine;
}
