import { categoryRepository } from "@/repositories/category.repository";

export const categoryService = {
  async listAll() {
    return categoryRepository.findAll();
  },

  async listTopLevel() {
    return categoryRepository.findTopLevel();
  },

  async getNames(): Promise<string[]> {
    return categoryRepository.getNames();
  },

  async getSubcategoryMap(): Promise<Record<string, string[]>> {
    return categoryRepository.getSubcategoryMap();
  },

  async create(values: { name: string; slug?: string; parentId?: string | null; description?: string }) {
    return categoryRepository.create(values);
  },

  async update(id: string, values: Partial<{ name: string; slug: string; parentId: string | null; description: string }>) {
    return categoryRepository.update(id, values);
  },

  async delete(id: string): Promise<void> {
    return categoryRepository.delete(id);
  },
};
