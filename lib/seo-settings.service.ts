import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { isReadOnlyFilesystem, resolveProjectPath } from "@/lib/project-paths";
import type { SeoSettings } from "@/lib/seo-settings.types";
import { hasSupabaseConfig, supabaseRest, supabaseRestCached } from "@/lib/supabase";

const seoFilePath = resolveProjectPath("data", "seo-settings.json");

const defaultSeoSettings: SeoSettings = {
  globalTitleSuffix: " | Novatech Machinery",
  defaultTitle: "Novatech Machinery",
  defaultDescription: "Used and industrial machinery marketplace for Novatech.",
  analytics: {
    googleAnalyticsId: "",
    metaPixelId: "",
    clarityProjectId: "",
  },
  pages: [
    {
      id: "seo-home",
      label: "Home",
      route: "/",
      title: "Novatech Machinery",
      description: "Industrial machinery marketplace homepage.",
      keywords: "used machines, industrial machines",
      canonicalUrl: "",
      ogTitle: "Novatech Machinery",
      ogDescription: "Industrial machinery marketplace homepage.",
      ogImageUrl: "",
      noIndex: false,
      noFollow: false,
    },
    {
      id: "seo-about",
      label: "About Us",
      route: "/about",
      title: "About Novatech",
      description: "About Novatech Machinery.",
      keywords: "about novatech",
      canonicalUrl: "",
      ogTitle: "About Novatech",
      ogDescription: "About Novatech Machinery.",
      ogImageUrl: "",
      noIndex: false,
      noFollow: false,
    },
    {
      id: "seo-categories",
      label: "Categories",
      route: "/categories",
      title: "Machine Categories",
      description: "Browse machine categories.",
      keywords: "machine categories",
      canonicalUrl: "",
      ogTitle: "Machine Categories",
      ogDescription: "Browse machine categories.",
      ogImageUrl: "",
      noIndex: false,
      noFollow: false,
    },
    {
      id: "seo-contact",
      label: "Contact",
      route: "/contact",
      title: "Contact Novatech",
      description: "Get in touch with Novatech.",
      keywords: "contact novatech",
      canonicalUrl: "",
      ogTitle: "Contact Novatech",
      ogDescription: "Get in touch with Novatech.",
      ogImageUrl: "",
      noIndex: false,
      noFollow: false,
    },
    {
      id: "seo-used",
      label: "Used Machinery",
      route: "/used-machinery",
      title: "Used Machinery",
      description: "Browse used machinery inventory.",
      keywords: "used machinery inventory",
      canonicalUrl: "",
      ogTitle: "Used Machinery",
      ogDescription: "Browse used machinery inventory.",
      ogImageUrl: "",
      noIndex: false,
      noFollow: false,
    },
  ],
};

function normalizeSeoSettings(settings: SeoSettings): SeoSettings {
  return {
    ...settings,
    analytics: {
      googleAnalyticsId: settings.analytics?.googleAnalyticsId ?? "",
      metaPixelId: settings.analytics?.metaPixelId ?? "",
      clarityProjectId: settings.analytics?.clarityProjectId ?? "",
    },
    pages: (settings.pages ?? []).map((page) => ({
      ...page,
      canonicalUrl: page.canonicalUrl ?? "",
      ogTitle: page.ogTitle ?? page.title ?? "",
      ogDescription: page.ogDescription ?? page.description ?? "",
      ogImageUrl: page.ogImageUrl ?? "",
      noIndex: page.noIndex ?? false,
      noFollow: page.noFollow ?? false,
    })),
  };
}

async function ensureSeoDir() {
  await mkdir(path.dirname(seoFilePath), { recursive: true });
}

export async function getSeoSettings() {
  if (hasSupabaseConfig()) {
    try {
      const data = await supabaseRestCached<{settings: SeoSettings}[]>("seo_settings?id=eq.main&select=settings");
      if (data && data.length > 0 && data[0].settings) {
        return normalizeSeoSettings(data[0].settings);
      }
    } catch (error) {
      console.error("Failed to fetch seo settings from Supabase, falling back to local.", error);
    }
  }

  try {
    const content = await readFile(seoFilePath, "utf8");
    return normalizeSeoSettings(JSON.parse(content) as SeoSettings);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await saveSeoSettings(defaultSeoSettings);
  return defaultSeoSettings;
}

export async function saveSeoSettings(settings: SeoSettings) {
  const normalizedSettings = normalizeSeoSettings(settings);
  if (!isReadOnlyFilesystem()) {
    try {
      await ensureSeoDir();
      await writeFile(seoFilePath, JSON.stringify(normalizedSettings, null, 2), "utf8");
    } catch (error) {
      console.error("Failed to write seo settings locally:", error);
    }
  } else {
    console.warn("Skipping local seo settings write on read-only filesystem (Vercel).");
  }

  if (hasSupabaseConfig()) {
    try {
      await supabaseRest("seo_settings", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates, return=minimal" },
        body: JSON.stringify([{ id: "main", settings: normalizedSettings }]),
      });
    } catch (error) {
      console.error("Failed to sync seo settings to Supabase", error);
    }
  }

  return normalizedSettings;
}
