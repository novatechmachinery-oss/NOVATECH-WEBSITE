import "server-only";

import { buildCategoryIndex, getAdminCatalog } from "@/lib/admin-catalog.service";
import type { AdminCategory, AdminMachine } from "@/lib/admin-catalog.types";
import type {
  CategoryRow,
  MachineCategory,
  MachineItem,
  MachineRow,
} from "@/lib/machine-catalog.types";
import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalText(value: unknown) {
  const text = asText(value);
  return text || undefined;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeMachineType(value: unknown): MachineItem["machineType"] {
  return asText(value).toLowerCase() === "cnc" ? "cnc" : "conventional";
}

function createCategoryMap(rows: CategoryRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function createCategoryRowsFromAdmin(categories: AdminCategory[]): CategoryRow[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parent_id: category.parentId,
    description: category.description ?? null,
    image_url: null,
    created_at: category.createdAt,
  }));
}

function buildImagePositions(length: number) {
  return Array.from({ length }, (_, index) => (index === 0 ? "center center" : "55% center"));
}

function formatSpecificationLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function buildMachineSpecifications(
  row: MachineRow,
  categoryName: string,
  subcategoryName?: string,
) {
  const specs: Array<{ label: string; value: string }> = [];

  const summarySpecs = [
    { label: "Manufacturer", value: row.brand },
    { label: "Model", value: row.model },
    { label: "Condition", value: row.condition },
    { label: "Serial / Stock Number", value: row.inventory_number ?? row.serial_number },
    { label: "Category", value: categoryName },
    { label: "Subcategory", value: subcategoryName },
    { label: "Machine Type", value: row.machine_type?.toUpperCase() },
    { label: "Origin", value: row.country_of_origin },
  ];

  for (const spec of summarySpecs) {
    const value = asOptionalText(spec.value);
    if (value) {
      specs.push({ label: spec.label, value });
    }
  }

  if (!row.specifications || typeof row.specifications !== "object" || Array.isArray(row.specifications)) {
    return specs;
  }

  for (const [key, rawValue] of Object.entries(row.specifications as Record<string, unknown>)) {
    const value = asOptionalText(rawValue);
    if (!value) {
      continue;
    }

    specs.push({
      label: formatSpecificationLabel(key),
      value,
    });
  }

  return specs;
}

function normalizeMachine(row: MachineRow, categoryMap: Map<string, CategoryRow>): MachineItem | null {
  const title = asText(row.name);

  if (!title || !row.category_id) {
    return null;
  }

  const directCategory = categoryMap.get(row.category_id);
  const parentCategory = directCategory?.parent_id
    ? categoryMap.get(directCategory.parent_id)
    : undefined;
  const mainCategory = parentCategory ?? directCategory;
  const subcategory = parentCategory ? directCategory : undefined;

  if (!mainCategory) {
    return null;
  }

  const images = asStringArray(row.images);
  const primaryImage = images[0] ?? "/images/hero-banner-Bt56BS_O.webp";
  const machineType = normalizeMachineType(row.machine_type);
  const imagePositions = images.length > 0 ? buildImagePositions(images.length) : ["center center"];
  const badgeTarget = subcategory?.name ?? mainCategory.name;

  return {
    id: row.id,
    title,
    category: mainCategory.name,
    categorySlug: mainCategory.slug,
    categoryId: mainCategory.id,
    subcategory: subcategory?.name,
    subcategorySlug: subcategory?.slug,
    subcategoryId: subcategory?.id,
    machineType,
    imageSrc: primaryImage,
    imageAlt: title,
    imagePosition: "center center",
    location: asOptionalText(row.country_of_origin) ?? "",
    description: asOptionalText(row.description) ?? "Please contact Novatech for full machine details.",
    manufacturer: asOptionalText(row.brand),
    model: asOptionalText(row.model),
    condition: asOptionalText(row.condition),
    stockNumber: asOptionalText(row.inventory_number ?? row.serial_number),
    support: "Inspection, loading and export assistance available",
    images: images.length > 0 ? images : [primaryImage],
    imagePositions,
    isSpecialDeal: Boolean(row.special_deal ?? row.featured),
    dealBadge: `${machineType.toUpperCase()} - ${badgeTarget}`,
    dealDescription:
      asOptionalText(row.brand && row.model ? `${row.brand} ${row.model}` : row.description) ??
      "Premium industrial machine",
    createdAt: row.created_at,
    specifications: buildMachineSpecifications(row, mainCategory.name, subcategory?.name),
  };
}

function normalizeAdminMachine(
  machine: AdminMachine,
  categoryMap: Map<string, AdminCategory>,
): MachineItem | null {
  const directCategory = categoryMap.get(machine.categoryId);
  const parentCategory = directCategory?.parentId ? categoryMap.get(directCategory.parentId) : undefined;
  const mainCategory = parentCategory ?? directCategory;
  const subcategory = parentCategory ? directCategory : undefined;

  if (!mainCategory) {
    return null;
  }

  const primaryImage = machine.images[0] ?? "/images/hero-banner-Bt56BS_O.webp";
  const imagePositions = machine.images.length > 0 ? buildImagePositions(machine.images.length) : ["center center"];
  const badgeTarget = subcategory?.name ?? mainCategory.name;

  return {
    id: machine.id,
    title: machine.name,
    category: mainCategory.name,
    categorySlug: mainCategory.slug,
    categoryId: mainCategory.id,
    subcategory: subcategory?.name,
    subcategorySlug: subcategory?.slug,
    subcategoryId: subcategory?.id,
    machineType: machine.machineType,
    imageSrc: primaryImage,
    imageAlt: machine.name,
    imagePosition: "center center",
    location: machine.countryOfOrigin ?? "",
    description: machine.description ?? "Please contact Novatech for full machine details.",
    manufacturer: machine.brand,
    model: machine.model,
    condition: machine.condition,
    stockNumber: machine.inventoryNumber ?? machine.serialNumber,
    support: "Inspection, loading and export assistance available",
    images: machine.images.length > 0 ? machine.images : [primaryImage],
    imagePositions,
    isSpecialDeal: machine.specialDeal,
    dealBadge: `${machine.machineType.toUpperCase()} - ${badgeTarget}`,
    dealDescription:
      asOptionalText(machine.brand && machine.model ? `${machine.brand} ${machine.model}` : machine.description) ??
      "Premium industrial machine",
    createdAt: machine.createdAt,
    specifications: [
      ...(machine.brand ? [{ label: "Manufacturer", value: machine.brand }] : []),
      ...(machine.model ? [{ label: "Model", value: machine.model }] : []),
      ...(machine.condition ? [{ label: "Condition", value: machine.condition }] : []),
      ...(machine.countryOfOrigin ? [{ label: "Origin", value: machine.countryOfOrigin }] : []),
      ...(machine.serialNumber || machine.inventoryNumber
        ? [{ label: "Serial / Stock Number", value: machine.inventoryNumber ?? machine.serialNumber ?? "" }]
        : []),
      ...Object.entries(machine.specifications).map(([key, value]) => ({
        label: formatSpecificationLabel(key),
        value,
      })),
    ],
  };
}

export async function getCategories() {
  const adminCatalog = await getAdminCatalog();
  if (adminCatalog.categories.length > 0 || adminCatalog.machines.length > 0) {
    return createCategoryRowsFromAdmin(adminCatalog.categories);
  }

  if (!hasSupabaseConfig()) {
    return [] as CategoryRow[];
  }

  try {
    return await supabaseRest<CategoryRow[]>("categories?select=*&order=name.asc");
  } catch (error) {
    console.error("Failed to fetch categories from Supabase.", error);
    return [] as CategoryRow[];
  }
}

export async function getMachineInventory() {
  const adminCatalog = await getAdminCatalog();
  if (adminCatalog.categories.length > 0 || adminCatalog.machines.length > 0) {
    const categoryMap = buildCategoryIndex(adminCatalog.categories);
    return adminCatalog.machines
      .filter((machine) => machine.stockStatus !== "sold")
      .map((machine) => normalizeAdminMachine(machine, categoryMap))
      .filter((machine): machine is MachineItem => machine !== null);
  }

  if (!hasSupabaseConfig()) {
    return [] as MachineItem[];
  }

  const [categories, machineRows] = await Promise.all([
    getCategories(),
    supabaseRest<MachineRow[]>("machines?select=*&stock_status=neq.sold&order=created_at.desc").catch(
      (error) => {
        console.error("Failed to fetch machines from Supabase.", error);
        return [] as MachineRow[];
      },
    ),
  ]);

  const categoryMap = createCategoryMap(categories);

  return machineRows
    .map((row) => normalizeMachine(row, categoryMap))
    .filter((machine): machine is MachineItem => machine !== null);
}

export function deriveMachineCategories(machines: MachineItem[], categories: CategoryRow[]) {
  const counts = new Map<string, number>();

  for (const machine of machines) {
    if (machine.categoryId) {
      counts.set(machine.categoryId, (counts.get(machine.categoryId) ?? 0) + 1);
    }

    if (machine.subcategoryId) {
      counts.set(machine.subcategoryId, (counts.get(machine.subcategoryId) ?? 0) + 1);
    }
  }

  return categories
    .filter((category) => !category.parent_id)
    .map((category) => {
      const children = categories.filter((item) => item.parent_id === category.id);
      const totalCount =
        (counts.get(category.id) ?? 0) +
        children.reduce((sum, child) => sum + (counts.get(child.id) ?? 0), 0);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        sub: children.map((item) => item.name),
        count: totalCount,
      } satisfies MachineCategory;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getMachineCatalogData() {
  const [categories, machineInventory] = await Promise.all([getCategories(), getMachineInventory()]);

  return {
    machineInventory,
    machineCategories: deriveMachineCategories(machineInventory, categories),
  };
}

export async function getSpecialDeals(limit = 4) {
  const machines = await getMachineInventory();
  const source = machines.some((machine) => machine.isSpecialDeal)
    ? machines.filter((machine) => machine.isSpecialDeal)
    : machines;

  return source.slice(0, limit).map((machine) => ({
    machineId: machine.id,
    badge: machine.dealBadge ?? machine.category,
    title: machine.title,
    description: machine.dealDescription ?? machine.description,
    imageSrc: machine.imageSrc,
    imageAlt: machine.imageAlt,
    imagePosition: machine.imagePosition,
    images: machine.images?.length ? machine.images : [machine.imageSrc],
    imagePositions: machine.imagePositions,
  }));
}
