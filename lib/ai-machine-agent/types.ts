import type { MachineItem } from "@/lib/machines";

export type AgentLanguage = "english" | "hindi" | "punjabi" | "tamil" | "marathi" | "bengali";

export type NumericSearchCriterion = {
  raw: string;
  fieldHint?: string;
  value?: number;
  min?: number;
  max?: number;
  approximate: boolean;
};

export type MachineSearchIntent = {
  query: string;
  normalizedQuery: string;
  textTerms: string[];
  phraseTerms: string[];
  numericCriteria: NumericSearchCriterion[];
  wantsMore: boolean;
  wantsBigger: boolean;
  limit: number;
};

export type AgentSearchContext = {
  textTerms?: string[];
  phraseTerms?: string[];
  numericCriteria?: NumericSearchCriterion[];
  lastFieldHint?: string;
  offset?: number;
};

export type RelevantSpec = {
  label: string;
  value: string;
};

export type AgentMachineResult = {
  id: string;
  title: string;
  url: string;
  manufacturer?: string;
  model?: string;
  category?: string;
  subcategory?: string;
  referenceNumber?: number;
  relevantSpecs: RelevantSpec[];
  score: number;
  exact: boolean;
};

export type AgentSearchResponse = {
  message: string;
  results: AgentMachineResult[];
  context: AgentSearchContext;
  needsClarification?: boolean;
};

export type RankedMachine = {
  machine: MachineItem;
  score: number;
  exact: boolean;
  relevantSpecs: RelevantSpec[];
};
