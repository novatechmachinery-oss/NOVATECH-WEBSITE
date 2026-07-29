import "server-only";

import type { Metadata } from "next";

import type { SeoPageRecord } from "@/lib/seo-settings.types";
import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSeoConfig } from "@/lib/seo/seo-config";

function normalizeRoute(route: string) {
  if (!route) {
    return "/";
  }
  if (/^https?:\/\//i.test(route)) {
    const parsed = new URL(route);
    return `${parsed.pathname}${parsed.search}` || "/";
  }
  return route.startsWith("/") ? route : `/${route}`;
}

function toAbsoluteUrl(baseUrl: string, value: string) {
  if (!value) {
    return baseUrl;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${normalized}`;
}

function splitKeywords(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendTitleSuffix(title: string, suffix: string) {
  const normalizedTitle = title.trim();
  const normalizedSuffix = suffix.trim();

  if (!normalizedTitle) {
    return normalizedSuffix.replace(/^\|\s*/, "").trim();
  }
  if (!normalizedSuffix) {
    return normalizedTitle;
  }

  // Extract content after the | separator (e.g. "| Novatech Machinery" → "Novatech Machinery")
  const suffixContent = normalizedSuffix.replace(/^\|\s*/, "").trim();

  // Don't append if already ends with full suffix, or title equals suffix content (avoids duplication)
  if (
    normalizedTitle.endsWith(normalizedSuffix) ||
    normalizedTitle === suffixContent ||
    normalizedTitle.toLowerCase() === suffixContent.toLowerCase()
  ) {
    return normalizedTitle;
  }

  return `${normalizedTitle}${normalizedSuffix}`;
}

function findPageRecord(pages: SeoPageRecord[], route: string, fallbackRoutes?: string[]) {
  const candidates = [route, ...(fallbackRoutes ?? [])].map(normalizeRoute);
  return pages.find((page) => candidates.includes(normalizeRoute(page.route)));
}

export function buildSeoRoute(pathname: string, params?: Record<string, string | null | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (!value) continue;
    query.set(key, value);
  }

  const normalizedPath = normalizeRoute(pathname);
  const queryString = query.toString();
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
}

type MetadataOptions = {
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackKeywords?: string[];
  lookupRoutes?: string[];
  canonicalRoute?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  openGraphImage?: string;
};

export async function generatePageMetadata(
  route: string,
  options: MetadataOptions = {},
): Promise<Metadata> {
  const [seoSettings, seoConfig] = await Promise.all([getSeoSettings(), getSeoConfig()]);
  const page = findPageRecord(seoSettings.pages, route, options.lookupRoutes);

  const description =
    page?.description?.trim() ||
    options.fallbackDescription ||
    seoConfig.defaultDescription;
  const titleBase = page?.title?.trim() || options.fallbackTitle || seoConfig.defaultTitle;
  const canonicalPath = page?.canonicalUrl || options.canonicalRoute || route;
  const canonical = toAbsoluteUrl(seoConfig.baseUrl, canonicalPath);
  const ogTitleBase = page?.ogTitle?.trim() || titleBase;
  const ogDescription = page?.ogDescription?.trim() || description;
  const ogImage = toAbsoluteUrl(
    seoConfig.baseUrl,
    options.openGraphImage || page?.ogImageUrl?.trim() || seoConfig.defaultOgImage,
  );
  const keywords = page?.keywords?.trim()
    ? splitKeywords(page.keywords)
    : options.fallbackKeywords;

  const index = !(options.noIndex ?? page?.noIndex ?? false);
  const follow = !(options.noFollow ?? page?.noFollow ?? false);

  return {
    title: appendTitleSuffix(titleBase, seoConfig.titleSuffix),
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index,
      follow,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: appendTitleSuffix(ogTitleBase, seoConfig.titleSuffix),
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: seoConfig.siteName,
      locale: seoConfig.defaultLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: appendTitleSuffix(ogTitleBase, seoConfig.titleSuffix),
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

