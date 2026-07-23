import { getMachineCatalogData } from "@/lib/machines";
import { getMachinePath } from "@/lib/machine-urls";
import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSeoConfig } from "@/lib/seo/seo-config";

export const revalidate = 3600;

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
  images?: string[];
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function validDate(value: string | Date | undefined, fallback: Date) {
  const date = value instanceof Date ? value : new Date(value || "");
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function GET() {
  const [seoSettings, seoConfig, catalog] = await Promise.all([
    getSeoSettings(),
    getSeoConfig(),
    getMachineCatalogData(),
  ]);
  const now = new Date();
  const { categoryRows, machineInventory } = catalog;

  const productionUrl = (value: string) => {
    const raw = value || "/";
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      return parsed.pathname === "/" && !parsed.search
        ? seoConfig.baseUrl
        : `${seoConfig.baseUrl}${parsed.pathname}${parsed.search}`;
    }
    if (raw === "/") return seoConfig.baseUrl;
    return `${seoConfig.baseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
  };

  const publicPages: SitemapEntry[] = seoSettings.pages
    .filter(
      (page) =>
        !page.noIndex &&
        !/[?&]machine=/.test(page.route) &&
        !/^\/used-machinery\?/.test(page.route),
    )
    .map((page) => ({
      url: productionUrl(page.canonicalUrl || page.route),
      lastModified: now,
      changeFrequency: page.route === "/" ? "weekly" : "monthly",
      priority: page.route === "/" ? 1 : 0.9,
    }));

  const explicitlyNoIndex = new Set(
    seoSettings.pages
      .filter((page) => page.noIndex)
      .map((page) => page.route.split("?")[0]),
  );
  const requiredPublicRoutes = [
    "/",
    "/about",
    "/categories",
    "/contact",
    "/used-machinery",
    "/metal-working-machinery",
    "/special-deals",
    "/carbide-scrap",
    "/privacy-policy",
    "/terms-of-service",
    "/textile-machinery",
    "/plastic-machinery",
    "/pharmaceutical-machinery",
  ];
  const guaranteedPublicPages: SitemapEntry[] = requiredPublicRoutes
    .filter((route) => !explicitlyNoIndex.has(route))
    .map((route) => ({
      url: productionUrl(route),
      lastModified: now,
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : route === "/privacy-policy" || route === "/terms-of-service" ? 0.4 : 0.9,
    }));

  const rootCategories = categoryRows.filter((category) => !category.parent_id);
  const rootById = new Map(rootCategories.map((category) => [category.id, category]));
  const categoryPages: SitemapEntry[] = categoryRows.flatMap((category) => {
    const parent = category.parent_id ? rootById.get(category.parent_id) : undefined;
    if (category.parent_id && !parent) return [];

    const route = parent
      ? `/used-machinery?category=${encodeURIComponent(parent.slug)}&subcategory=${encodeURIComponent(category.slug)}`
      : category.name.trim().toLowerCase() === "special deals"
        ? "/special-deals"
        : `/used-machinery?category=${encodeURIComponent(category.slug)}`;

    return [{
      url: productionUrl(route),
      lastModified: validDate(category.created_at, now),
      changeFrequency: "weekly",
      priority: parent ? 0.72 : 0.8,
    }];
  });

  const machinePages: SitemapEntry[] = machineInventory.map((machine) => ({
    url: `${seoConfig.baseUrl}${getMachinePath(machine)}`,
    lastModified: validDate(machine.updatedAt || machine.createdAt, now),
    changeFrequency: "weekly",
    priority: 0.82,
    images: machine.imageSrc
      ? [/^https?:\/\//i.test(machine.imageSrc) ? machine.imageSrc : productionUrl(machine.imageSrc)]
      : undefined,
  }));

  const entries = Array.from(
    new Map(
      [...publicPages, ...guaranteedPublicPages, ...categoryPages, ...machinePages]
        .map((entry) => [entry.url, entry]),
    ).values(),
  );
  if (!entries.some((entry) => entry.url === seoConfig.baseUrl)) {
    entries.unshift({
      url: seoConfig.baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map((entry) => `<url>
  <loc>${escapeXml(entry.url)}</loc>
${(entry.images || []).map((image) => `  <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>\n`).join("")}  <lastmod>${entry.lastModified.toISOString()}</lastmod>
  <changefreq>${entry.changeFrequency}</changefreq>
  <priority>${entry.priority}</priority>
</url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
