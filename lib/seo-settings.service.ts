import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SeoSettings } from "@/lib/seo-settings.types";

const seoFilePath = path.join(process.cwd(), "data", "seo-settings.json");

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
    { id: "seo-home", label: "Home", route: "/", title: "Novatech Machinery", description: "Industrial machinery marketplace homepage.", keywords: "used machines, industrial machines" },
    { id: "seo-about", label: "About Us", route: "/about", title: "About Novatech", description: "About Novatech Machinery.", keywords: "about novatech" },
    { id: "seo-categories", label: "Categories", route: "/categories", title: "Machine Categories", description: "Browse machine categories.", keywords: "machine categories" },
    { id: "seo-contact", label: "Contact", route: "/contact", title: "Contact Novatech", description: "Get in touch with Novatech.", keywords: "contact novatech" },
    { id: "seo-used", label: "Used Machinery", route: "/used-machinery", title: "Used Machinery", description: "Browse used machinery inventory.", keywords: "used machinery inventory" },
  ],
};

async function ensureSeoDir() {
  await mkdir(path.dirname(seoFilePath), { recursive: true });
}

export async function getSeoSettings() {
  try {
    const content = await readFile(seoFilePath, "utf8");
    return JSON.parse(content) as SeoSettings;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await saveSeoSettings(defaultSeoSettings);
  return defaultSeoSettings;
}

export async function saveSeoSettings(settings: SeoSettings) {
  await ensureSeoDir();
  await writeFile(seoFilePath, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
