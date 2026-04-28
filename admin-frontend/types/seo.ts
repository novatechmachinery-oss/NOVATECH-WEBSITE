export type SeoPageSource = "system" | "category" | "machine" | "custom";

export type SeoPageRecord = {
  id: string;
  path: string;
  pageTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  noIndex: boolean;
  noFollow: boolean;
  source: SeoPageSource;
  lockedPath: boolean;
  updatedAt: string | null;
};

export type SeoGlobalSettings = {
  siteName: string;
  siteUrl: string;
  titleSuffix: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  twitterHandle: string;
};

export type SeoMachineTemplate = {
  machineTitleTemplate: string;
  machineDescriptionTemplate: string;
  categoryTitleTemplate: string;
  categoryDescriptionTemplate: string;
};

export type SeoWorkspace = {
  pages: SeoPageRecord[];
  global: SeoGlobalSettings;
  machineTemplate: SeoMachineTemplate;
};
