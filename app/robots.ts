import type { MetadataRoute } from "next";

import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSiteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seoSettings = await getSeoSettings();
  const hasBlockedPublicPages = seoSettings.pages.some((page) => page.noIndex || page.noFollow);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
    ...(hasBlockedPublicPages ? {} : {}),
  };
}

