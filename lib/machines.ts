export type {
  CategoryRow,
  MachineCategory,
  MachineItem,
  MachineRow,
  MachineSearchItem,
} from "@/lib/machine-catalog.types";

export {
  deriveMachineCategories,
  getCategories,
  getMachineCatalogData,
  getMachineById,
  getMachineBySlug,
  getMachineInventory,
  getMachineSearchIndex,
  getSpecialDeals,
} from "@/lib/machine-catalog.service";

