import "server-only";

import { getSeoSettings } from "@/lib/seo-settings.service";
import { getSiteSettings } from "@/lib/site-settings.service";

const FALLBACK_SITE_URL = "https://novatechmachinery.com";
const FALLBACK_LOCALE = "en_IN";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export async function getSeoConfig() {
  const [seoSettings, siteSettings] = await Promise.all([getSeoSettings(), getSiteSettings()]);
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const baseUrl = trimTrailingSlash(configuredUrl || FALLBACK_SITE_URL);
  const configuredName = siteSettings.companyName || seoSettings.defaultTitle || "Novatech Machinery";
  const siteName = configuredName.trim().toLowerCase() === "novatech"
    ? "Novatech Machinery"
    : configuredName;

  return {
    siteName,
    baseUrl,
    titleSuffix: seoSettings.globalTitleSuffix || " | Novatech Machinery",
    defaultTitle: seoSettings.defaultTitle || siteName,
    defaultDescription:
      seoSettings.defaultDescription ||
      "Used and industrial machinery marketplace for Novatech Machinery.",
    defaultOgImage: `${baseUrl}/images/10.png`,
    defaultLocale: FALLBACK_LOCALE,
  };
}

