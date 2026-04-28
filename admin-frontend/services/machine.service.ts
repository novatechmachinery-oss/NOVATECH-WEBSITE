import { machineRepository, type MachineFilters } from "@/repositories/machine.repository";
import { leadRepository } from "@/repositories/lead.repository";
import { categoryRepository } from "@/repositories/category.repository";
import type { Machine, MachineFormValues } from "@/types/machine";

function slugifyId(name: string): string {
  return `MCH-${Date.now().toString(36).toUpperCase()}`;
}

function parseSpecifications(text: string) {
  return text.split(",").map((item) => item.trim()).filter(Boolean).map((item) => {
    const [key, ...rest] = item.split(":");
    return { key: key?.trim() || "Specification", value: rest.join(":").trim() || "-" };
  });
}

function parseImages(text: string): string[] {
  return text.split(",").map((u) => u.trim()).filter(Boolean);
}

export const machineService = {
  async list(filters: MachineFilters = {}) {
    return machineRepository.findAll(filters);
  },

  async get(id: string): Promise<Machine | null> {
    return machineRepository.findById(id);
  },

  async create(values: MachineFormValues): Promise<Machine> {
    const id = slugifyId(values.name);
    return machineRepository.create({
      id,
      name: values.name,
      brand: values.brand,
      model: values.model,
      serialNumber: values.serialNumber,
      countryOfOrigin: values.countryOfOrigin,
      price: values.price,
      category: values.category,
      subcategory: values.subcategory,
      condition: values.condition,
      stockStatus: values.stockStatus,
      machineType: values.machineType,
      description: values.description,
      specifications: parseSpecifications(values.specificationsText),
      images: parseImages(values.imagesText),
      isPublished: true,
      isSpecialDeal: false,
    });
  },

  async update(id: string, values: MachineFormValues): Promise<Machine> {
    return machineRepository.update(id, {
      name: values.name,
      brand: values.brand,
      model: values.model,
      serialNumber: values.serialNumber,
      countryOfOrigin: values.countryOfOrigin,
      price: values.price,
      category: values.category,
      subcategory: values.subcategory,
      condition: values.condition,
      stockStatus: values.stockStatus,
      machineType: values.machineType,
      description: values.description,
      specifications: parseSpecifications(values.specificationsText),
      images: parseImages(values.imagesText),
    });
  },

  async delete(id: string): Promise<void> {
    return machineRepository.delete(id);
  },

  async getDashboardStats() {
    const [machineStats, leads, categories, subcategoryMap] = await Promise.all([
      machineRepository.getStats(),
      leadRepository.findAll(),
      categoryRepository.getNames(),
      categoryRepository.getSubcategoryMap(),
    ]);
    return {
      ...machineStats,
      totalLeads: leads.length,
      newToday: leads.filter((l) => l.stage === "New").length,
      dealsWon: leads.filter((l) => l.stage === "Won").length,
      totalCategories: categories.length,
      totalSubcategories: Object.values(subcategoryMap).flat().length,
    };
  },
};
