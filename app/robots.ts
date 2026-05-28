import type { MetadataRoute } from "next";

import { getSeoConfig } from "@/lib/seo/seo-config";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { baseUrl } = await getSeoConfig();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/_next/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

