import type { CategoryRow, MachineItem } from "@/lib/machines";

export type CatalogSelection = {
  isValid: boolean;
  category: CategoryRow | null;
  subcategory: CategoryRow | null;
  heading: string;
  description: string;
  categoryName: string | null;
  subcategoryName: string | null;
};

function matchesCategory(category: CategoryRow, value: string) {
  const normalized = value.trim().toLowerCase();
  return category.slug.toLowerCase() === normalized || category.name.toLowerCase() === normalized;
}

export function resolveCatalogSelection(
  categoryValue: string | null,
  subcategoryValue: string | null,
  categoryRows: CategoryRow[],
  machines: MachineItem[],
): CatalogSelection {
  const rootCategories = categoryRows.filter((category) => !category.parent_id);
  let category = categoryValue
    ? rootCategories.find((item) => matchesCategory(item, categoryValue)) ?? null
    : null;
  let subcategory: CategoryRow | null = null;

  if (subcategoryValue) {
    const categoryId = category?.id;
    const candidates = category
      ? categoryRows.filter((item) => item.parent_id === categoryId)
      : categoryRows.filter((item) => Boolean(item.parent_id));
    subcategory = candidates.find((item) => matchesCategory(item, subcategoryValue)) ?? null;

    if (subcategory && !category) {
      category = rootCategories.find((item) => item.id === subcategory?.parent_id) ?? null;
    }
  }

  const isValid =
    (!categoryValue || Boolean(category)) &&
    (!subcategoryValue || Boolean(subcategory)) &&
    (!subcategory || subcategory.parent_id === category?.id);
  const categoryName = category?.name ?? null;
  const subcategoryName = subcategory?.name ?? null;
  const matchingCount = machines.filter((machine) => {
    if (subcategoryName) return machine.subcategory === subcategoryName;
    if (categoryName) return machine.category === categoryName;
    return true;
  }).length;
  const selectedName = subcategoryName || categoryName;
  const storedDescription = subcategory?.description?.trim() || category?.description?.trim();
  const description = storedDescription || (selectedName
    ? `Browse ${matchingCount || "available"} used ${selectedName.toLowerCase()} listings with photos, specifications, and direct enquiry support from Novatech Machinery.`
    : "Browse available used CNC machines, conventional machines, and industrial machinery with photos, specifications, and direct enquiry support.");

  return {
    isValid,
    category,
    subcategory,
    heading: selectedName ? `${selectedName} for Sale` : "Used Machinery for Sale",
    description,
    categoryName,
    subcategoryName,
  };
}

export function filterMachinesForSelection(
  machines: MachineItem[],
  selection: CatalogSelection,
) {
  return machines.filter((machine) => {
    if (selection.subcategoryName) return machine.subcategory === selection.subcategoryName;
    if (selection.categoryName) {
      if (selection.categoryName.toLowerCase() === "special deals") return machine.isSpecialDeal;
      return machine.category === selection.categoryName;
    }
    return true;
  });
}
