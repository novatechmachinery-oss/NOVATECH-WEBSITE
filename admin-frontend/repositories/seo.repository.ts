import { supabase } from "@/lib/supabase";
import type { SeoPageRecord, SeoGlobalSettings, SeoMachineTemplate, SeoWorkspace } from "@/types/seo";

function toSeoPage(row: Record<string, unknown>): SeoPageRecord {
  return {
    id: row.id as string,
    path: row.path as string,
    pageTitle: row.page_title as string,
    metaTitle: (row.meta_title as string) ?? "",
    metaDescription: (row.meta_description as string) ?? "",
    keywords: (row.keywords as string) ?? "",
    canonicalUrl: (row.canonical_url as string) ?? "",
    ogTitle: (row.og_title as string) ?? "",
    ogDescription: (row.og_description as string) ?? "",
    noIndex: (row.no_index as boolean) ?? false,
    noFollow: (row.no_follow as boolean) ?? false,
    source: row.source as SeoPageRecord["source"],
    lockedPath: (row.locked_path as boolean) ?? true,
    updatedAt: (row.updated_at as string) ?? null,
  };
}

function toGlobal(row: Record<string, unknown>): SeoGlobalSettings {
  return {
    siteName: (row.site_name as string) ?? "Novatech Machinery",
    siteUrl: (row.site_url as string) ?? "https://novatechmachinery.com",
    titleSuffix: (row.title_suffix as string) ?? "| Novatech Machinery",
    defaultMetaDescription: (row.default_meta_description as string) ?? "",
    defaultKeywords: (row.default_keywords as string) ?? "",
    defaultOgImage: (row.default_og_image as string) ?? "",
    twitterHandle: (row.twitter_handle as string) ?? "@novatechmachinery",
  };
}

function toTemplate(row: Record<string, unknown>): SeoMachineTemplate {
  return {
    machineTitleTemplate: (row.machine_title_template as string) ?? "{machineName} {brand} {model} {titleSuffix}",
    machineDescriptionTemplate: (row.machine_description_template as string) ?? "",
    categoryTitleTemplate: (row.category_title_template as string) ?? "{categoryName} Machines {titleSuffix}",
    categoryDescriptionTemplate: (row.category_description_template as string) ?? "",
  };
}

export const seoRepository = {
  async getWorkspace(): Promise<SeoWorkspace> {
    const [pagesResult, globalResult] = await Promise.all([
      supabase.from("seo_pages").select("*").order("path", { ascending: true }),
      supabase.from("seo_global").select("*").eq("id", "global").single(),
    ]);
    if (pagesResult.error) throw new Error(pagesResult.error.message);
    const pages = (pagesResult.data ?? []).map(toSeoPage);
    const globalRow = globalResult.data;
    return {
      pages,
      global: globalRow ? toGlobal(globalRow) : ({} as SeoGlobalSettings),
      machineTemplate: globalRow ? toTemplate(globalRow) : ({} as SeoMachineTemplate),
    };
  },

  async getPages(): Promise<SeoPageRecord[]> {
    const { data, error } = await supabase.from("seo_pages").select("*").order("path");
    if (error) throw new Error(error.message);
    return (data ?? []).map(toSeoPage);
  },

  async getPageByPath(path: string): Promise<SeoPageRecord | null> {
    const { data, error } = await supabase.from("seo_pages").select("*").eq("path", path).single();
    if (error) { if (error.code === "PGRST116") return null; throw new Error(error.message); }
    return data ? toSeoPage(data) : null;
  },

  async upsertPage(page: Partial<SeoPageRecord> & { id: string; path: string; pageTitle: string }): Promise<SeoPageRecord> {
    const { data, error } = await supabase.from("seo_pages").upsert({
      id: page.id,
      path: page.path,
      page_title: page.pageTitle,
      meta_title: page.metaTitle ?? "",
      meta_description: page.metaDescription ?? "",
      keywords: page.keywords ?? "",
      canonical_url: page.canonicalUrl ?? page.path,
      og_title: page.ogTitle ?? page.metaTitle ?? "",
      og_description: page.ogDescription ?? page.metaDescription ?? "",
      no_index: page.noIndex ?? false,
      no_follow: page.noFollow ?? false,
      source: page.source ?? "custom",
      locked_path: page.lockedPath ?? false,
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) throw new Error(error.message);
    return toSeoPage(data);
  },

  async deletePage(id: string): Promise<void> {
    const { error } = await supabase.from("seo_pages").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async updateGlobal(global: Partial<SeoGlobalSettings & SeoMachineTemplate>): Promise<void> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (global.siteName) patch.site_name = global.siteName;
    if (global.siteUrl) patch.site_url = global.siteUrl;
    if (global.titleSuffix !== undefined) patch.title_suffix = global.titleSuffix;
    if (global.defaultMetaDescription !== undefined) patch.default_meta_description = global.defaultMetaDescription;
    if (global.defaultKeywords !== undefined) patch.default_keywords = global.defaultKeywords;
    if (global.defaultOgImage !== undefined) patch.default_og_image = global.defaultOgImage;
    if (global.twitterHandle !== undefined) patch.twitter_handle = global.twitterHandle;
    if (global.machineTitleTemplate !== undefined) patch.machine_title_template = global.machineTitleTemplate;
    if (global.machineDescriptionTemplate !== undefined) patch.machine_description_template = global.machineDescriptionTemplate;
    if (global.categoryTitleTemplate !== undefined) patch.category_title_template = global.categoryTitleTemplate;
    if (global.categoryDescriptionTemplate !== undefined) patch.category_description_template = global.categoryDescriptionTemplate;
    const { error } = await supabase.from("seo_global").update(patch).eq("id", "global");
    if (error) throw new Error(error.message);
  },
};
