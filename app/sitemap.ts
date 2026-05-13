import type { MetadataRoute } from "next";

import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSeoConfig } from "@/lib/seo/seo-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seoSettings, seoConfig] = await Promise.all([getSeoSettings(), getSeoConfig()]);
  const now = new Date();

  const publicPages = seoSettings.pages
    .filter((page) => !page.noIndex)
    .map((page) => ({
      url: page.canonicalUrl?.startsWith("http")
        ? page.canonicalUrl
        : `${seoConfig.baseUrl}${(page.canonicalUrl || page.route).startsWith("/") ? "" : "/"}${page.canonicalUrl || page.route}`,
      lastModified: now,
      changeFrequency: page.route === "/" ? "weekly" : "monthly",
      priority: page.route === "/" ? 1 : page.route.includes("?subcategory=") ? 0.68 : page.route.includes("?category=") ? 0.8 : 0.9,
    })) satisfies MetadataRoute.Sitemap;

  const uniqueEntries = Array.from(new Map(publicPages.map((item) => [item.url, item])).values());

  if (!uniqueEntries.some((entry) => entry.url === seoConfig.baseUrl)) {
    uniqueEntries.unshift({
      url: seoConfig.baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  return uniqueEntries;
}
