export type SeoPageRecord = {
  id: string;
  label: string;
  route: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  noIndex: boolean;
  noFollow: boolean;
};

export type SeoSettings = {
  globalTitleSuffix: string;
  defaultTitle: string;
  defaultDescription: string;
  analytics: {
    googleAnalyticsId: string;
    metaPixelId: string;
    clarityProjectId: string;
  };
  pages: SeoPageRecord[];
};
