import "server-only";

import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSiteSettings } from "@/lib/site-settings.service";

export async function getTrackingConfig() {
  const [seoSettings, siteSettings] = await Promise.all([getSeoSettings(), getSiteSettings()]);

  return {
    googleAnalyticsId:
      seoSettings.analytics.googleAnalyticsId ||
      siteSettings.operations.analytics.googleAnalyticsId ||
      "",
    metaPixelId:
      seoSettings.analytics.metaPixelId ||
      siteSettings.operations.analytics.metaPixelId ||
      "",
    clarityId:
      seoSettings.analytics.clarityProjectId ||
      siteSettings.operations.analytics.clarityProjectId ||
      "",
  };
}

