import { seoRepository } from "@/repositories/seo.repository";
import type { SeoGlobalSettings, SeoMachineTemplate, SeoPageRecord } from "@/types/seo";

function buildSeoId(source: string, path: string) {
  return `${source}:${path.startsWith("/") ? path : `/${path}`}`;
}

export const seoService = {
  async getWorkspace() {
    return seoRepository.getWorkspace();
  },

  async getPages() {
    return seoRepository.getPages();
  },

  async getPageByPath(path: string) {
    return seoRepository.getPageByPath(path);
  },

  async createPage(values: { path: string; pageTitle: string }) {
    const path = values.path.trim().startsWith("/") ? values.path.trim() : `/${values.path.trim()}`;
    const id = buildSeoId("custom", path);
    return seoRepository.upsertPage({ id, path, pageTitle: values.pageTitle, source: "custom", lockedPath: false });
  },

  async updatePage(id: string, updates: Partial<SeoPageRecord>) {
    const pages = await seoRepository.getPages();
    const page = pages.find((p) => p.id === id);
    if (!page) throw new Error("Page not found");
    const nextPath = page.lockedPath ? page.path : (updates.path?.trim() || page.path);
    const nextId = page.lockedPath ? page.id : buildSeoId(page.source, nextPath);
    return seoRepository.upsertPage({
      ...page,
      ...updates,
      id: nextId,
      path: nextPath.startsWith("/") ? nextPath : `/${nextPath}`,
      source: page.source,
      lockedPath: page.lockedPath,
    });
  },

  async deletePage(id: string) {
    const pages = await seoRepository.getPages();
    const page = pages.find((p) => p.id === id);
    if (!page || page.source !== "custom") throw new Error("Only custom pages can be deleted");
    return seoRepository.deletePage(id);
  },

  async updateGlobal(global: SeoGlobalSettings) {
    return seoRepository.updateGlobal(global);
  },

  async updateTemplate(template: SeoMachineTemplate) {
    return seoRepository.updateGlobal(template);
  },
};
