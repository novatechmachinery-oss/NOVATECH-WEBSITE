import type { MetadataRoute } from "next";

import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoSettings = await getSeoSettings();
  const now = new Date();

  const publicPages = seoSettings.pages
    .filter((page) => !page.noIndex)
    .map((page) => ({
      url: toAbsoluteUrl(page.canonicalUrl || page.route),
      lastModified: now,
      changeFrequency: page.route === "/" ? "weekly" : "monthly",
      priority: page.route === "/" ? 1 : page.route.includes("?subcategory=") ? 0.68 : page.route.includes("?category=") ? 0.8 : 0.9,
    })) satisfies MetadataRoute.Sitemap;

  const uniqueEntries = Array.from(new Map(publicPages.map((item) => [item.url, item])).values());

  if (!uniqueEntries.some((entry) => entry.url === getSiteUrl())) {
    uniqueEntries.unshift({
      url: getSiteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  return uniqueEntries;
}
