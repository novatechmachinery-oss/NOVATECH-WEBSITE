import "server-only";

import type { Metadata } from "next";

import { getSeoSettings } from "@/lib/seo-settings.service";
import type { SeoPageRecord } from "@/lib/seo-settings.types";
import { getSiteSettings } from "@/lib/site-settings.service";

const FALLBACK_SITE_URL = "https://novatechmachinery.com";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePath(value: string) {
  if (!value) {
    return "/";
  }

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    return `${url.pathname}${url.search}` || "/";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function splitKeywords(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return trimTrailingSlash(configuredUrl || FALLBACK_SITE_URL);
}

export function toAbsoluteUrl(value: string) {
  if (!value) {
    return getSiteUrl();
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${getSiteUrl()}${normalizePath(value)}`;
}

export function buildSeoRoute(
  pathname: string,
  params?: Record<string, string | null | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (!value) {
      continue;
    }

    query.set(key, value);
  }

  const normalizedPath = normalizePath(pathname);
  const queryString = query.toString();
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
}

function finalizeTitle(title: string, suffix: string) {
  const trimmedTitle = title.trim();
  const trimmedSuffix = suffix.trim();

  if (!trimmedTitle) {
    return trimmedSuffix.replace(/^\|\s*/, "").trim();
  }

  if (!trimmedSuffix || trimmedTitle.endsWith(trimmedSuffix)) {
    return trimmedTitle;
  }

  return `${trimmedTitle}${trimmedSuffix}`;
}

function findSeoPageByRoute(pages: SeoPageRecord[], routes: string[]) {
  const normalizedRoutes = routes.map((route) => normalizePath(route));
  return pages.find((page) => normalizedRoutes.includes(normalizePath(page.route)));
}

export async function getRootMetadata(): Promise<Metadata> {
  const [seoSettings, siteSettings] = await Promise.all([getSeoSettings(), getSiteSettings()]);
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteSettings.companyName,
    title: seoSettings.defaultTitle,
    description: seoSettings.defaultDescription,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: siteSettings.companyName,
      title: finalizeTitle(seoSettings.defaultTitle, seoSettings.globalTitleSuffix),
      description: seoSettings.defaultDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: finalizeTitle(seoSettings.defaultTitle, seoSettings.globalTitleSuffix),
      description: seoSettings.defaultDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function getSeoMetadata(
  route: string,
  fallback: {
    title: string;
    description: string;
    keywords?: string[];
  },
  options?: {
    lookupRoutes?: string[];
    canonicalRoute?: string;
  },
): Promise<Metadata> {
  const seoSettings = await getSeoSettings();
  const lookupRoutes = [route, ...(options?.lookupRoutes ?? [])];
  const matchedPage = findSeoPageByRoute(seoSettings.pages, lookupRoutes);

  const resolvedTitle = matchedPage?.title || fallback.title || seoSettings.defaultTitle;
  const resolvedDescription = matchedPage?.description || fallback.description || seoSettings.defaultDescription;
  const resolvedKeywords = matchedPage?.keywords
    ? splitKeywords(matchedPage.keywords)
    : fallback.keywords;
  const resolvedCanonical = matchedPage?.canonicalUrl || options?.canonicalRoute || route;
  const resolvedOgTitle = matchedPage?.ogTitle || resolvedTitle;
  const resolvedOgDescription = matchedPage?.ogDescription || resolvedDescription;
  const resolvedOgImage = matchedPage?.ogImageUrl ? toAbsoluteUrl(matchedPage.ogImageUrl) : undefined;
  const finalTitle = finalizeTitle(resolvedTitle, seoSettings.globalTitleSuffix);

  return {
    title: finalTitle,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    alternates: {
      canonical: toAbsoluteUrl(resolvedCanonical),
    },
    robots: {
      index: !(matchedPage?.noIndex ?? false),
      follow: !(matchedPage?.noFollow ?? false),
    },
    openGraph: {
      type: "website",
      url: toAbsoluteUrl(resolvedCanonical),
      title: finalizeTitle(resolvedOgTitle, seoSettings.globalTitleSuffix),
      description: resolvedOgDescription,
      images: resolvedOgImage ? [{ url: resolvedOgImage }] : undefined,
    },
    twitter: {
      card: resolvedOgImage ? "summary_large_image" : "summary",
      title: finalizeTitle(resolvedOgTitle, seoSettings.globalTitleSuffix),
      description: resolvedOgDescription,
      images: resolvedOgImage ? [resolvedOgImage] : undefined,
    },
  };
}

export async function getGlobalStructuredData() {
  const [siteSettings, seoSettings] = await Promise.all([getSiteSettings(), getSeoSettings()]);
  const siteUrl = getSiteUrl();

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteSettings.companyName,
      url: siteUrl,
      email: siteSettings.contact.emailAddress,
      telephone: siteSettings.contact.phonePrimary,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteSettings.contact.officeAddress,
        addressCountry: "IN",
      },
      sameAs: [`https://wa.me/${siteSettings.contact.whatsappNumber.replace(/\D/g, "")}`],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteSettings.companyName,
      url: siteUrl,
      description: seoSettings.defaultDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/used-machinery?category={category}`,
        "query-input": "required name=category",
      },
    },
  ];
}
