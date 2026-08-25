import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { buildCategoryIndex, getAdminCatalog } from "@/lib/admin-catalog.service";
import type { AdminCategory, AdminMachine } from "@/lib/admin-catalog.types";
import type {
  CategoryRow,
  MachineCategory,
  MachineItem,
  MachineRow,
  MachineSearchItem,
} from "@/lib/machine-catalog.types";
import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalText(value: unknown) {
  const text = asText(value);
  return text || undefined;
}

function asOptionalPositiveInteger(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }

  const text = asText(value);
  if (!text) {
    return undefined;
  }

  const parsed = Number(text);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function isReferenceNumberSpecKey(key: string) {
  return [
    "__referencenumber",
    "referencenumber",
    "reference_number",
    "ref. no.",
    "ref no",
    "reference number",
  ].includes(key.trim().toLowerCase());
}

function extractReferenceNumberFromSpecifications(specifications: unknown) {
  if (!specifications || typeof specifications !== "object" || Array.isArray(specifications)) {
    return undefined;
  }

  const entry = Object.entries(specifications as Record<string, unknown>).find(([key]) =>
    isReferenceNumberSpecKey(key),
  );
  return asOptionalPositiveInteger(entry?.[1]);
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeImageUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  const normalizedSlashes = trimmed.replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalizedSlashes)) {
    try {
      return encodeURI(normalizedSlashes);
    } catch {
      return normalizedSlashes;
    }
  }

  const withoutPublicPrefix = normalizedSlashes.replace(/^\.?\/?public\//i, "");
  const rootedPath = withoutPublicPrefix.startsWith("/")
    ? withoutPublicPrefix
    : `/${withoutPublicPrefix.replace(/^\/+/, "")}`;

  try {
    return encodeURI(rootedPath);
  } catch {
    return rootedPath;
  }
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
    if (isReferenceNumberSpecKey(key)) {
      continue;
    }

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

  const images = asStringArray(row.images).map(normalizeImageUrl).filter(Boolean);
  const primaryImage = images[0] ?? "/images/10.webp";
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
    referenceNumber:
      asOptionalPositiveInteger(row.reference_number) ?? extractReferenceNumberFromSpecifications(row.specifications),
    support: "Inspection, loading and export assistance available",
    images: images.length > 0 ? images : [primaryImage],
    imagePositions,
    isSpecialDeal: Boolean(row.special_deal ?? row.featured),
    dealBadge: `${machineType.toUpperCase()} - ${badgeTarget}`,
    dealDescription:
      asOptionalText(row.brand && row.model ? `${row.brand} ${row.model}` : row.description) ??
      "Premium industrial machine",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
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

  const images = machine.images.map(normalizeImageUrl).filter(Boolean);
  const primaryImage = images[0] ?? "/images/10.webp";
  const imagePositions = images.length > 0 ? buildImagePositions(images.length) : ["center center"];
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
    referenceNumber: machine.referenceNumber,
    support: "Inspection, loading and export assistance available",
    images: images.length > 0 ? images : [primaryImage],
    imagePositions,
    isSpecialDeal: machine.specialDeal,
    dealBadge: `${machine.machineType.toUpperCase()} - ${badgeTarget}`,
    dealDescription:
      asOptionalText(machine.brand && machine.model ? `${machine.brand} ${machine.model}` : machine.description) ??
      "Premium industrial machine",
    createdAt: machine.createdAt,
    updatedAt: machine.updatedAt,
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

function assignMachineReferenceNumbers(machines: MachineItem[]) {
  const assignedNumbers = new Set(
    machines
      .map((machine) => machine.referenceNumber)
      .filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value > 0),
  );
  const referenceNumbers = new Map<string, number>();
  let nextReferenceNumber = 1;

  machines
    .map((machine, index) => ({ machine, index }))
    .sort((left, right) => {
      const leftDate = Date.parse(left.machine.createdAt ?? "") || 0;
      const rightDate = Date.parse(right.machine.createdAt ?? "") || 0;

      if (leftDate !== rightDate) {
        return leftDate - rightDate;
      }

      return left.index - right.index;
    })
    .forEach(({ machine }) => {
      if (machine.referenceNumber) {
        referenceNumbers.set(machine.id, machine.referenceNumber);
        return;
      }

      while (assignedNumbers.has(nextReferenceNumber)) {
        nextReferenceNumber += 1;
      }

      referenceNumbers.set(machine.id, nextReferenceNumber);
      assignedNumbers.add(nextReferenceNumber);
      nextReferenceNumber += 1;
    });

  return machines.map((machine) => ({
    ...machine,
    referenceNumber: referenceNumbers.get(machine.id),
  }));
}

export async function getCategories() {
  const adminCatalog = await getAdminCatalog({ cache: "public" });
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

// Cross-request cache: Vercel serves this from cache for 120s instead of hitting Supabase
const getMachineInventoryCached = unstable_cache(
  async function _getMachineInventory() {
    const adminCatalog = await getAdminCatalog({ cache: "public" });
    if (adminCatalog.categories.length > 0 || adminCatalog.machines.length > 0) {
      const categoryMap = buildCategoryIndex(adminCatalog.categories);
      const machines = adminCatalog.machines
        .map((machine) => normalizeAdminMachine(machine, categoryMap))
        .filter((machine): machine is MachineItem => machine !== null);
      const soldMachineIds = new Set(
        adminCatalog.machines
          .filter((machine) => machine.stockStatus === "sold")
          .map((machine) => machine.id),
      );

      return assignMachineReferenceNumbers(machines).filter((machine) => !soldMachineIds.has(machine.id));
    }

    if (!hasSupabaseConfig()) {
      return [] as MachineItem[];
    }

    const [categories, machineRows] = await Promise.all([
      getCategories(),
      supabaseRest<MachineRow[]>("machines?select=*&order=created_at.desc").catch(
        (error) => {
          console.error("Failed to fetch machines from Supabase.", error);
          return [] as MachineRow[];
        },
      ),
    ]);

    const categoryMap = createCategoryMap(categories);

    const machines = machineRows
      .map((row) => normalizeMachine(row, categoryMap))
      .filter((machine): machine is MachineItem => machine !== null);
    const soldMachineIds = new Set(
      machineRows
        .filter((row) => asText(row.stock_status).toLowerCase() === "sold")
        .map((row) => row.id),
    );

    return assignMachineReferenceNumbers(machines).filter((machine) => !soldMachineIds.has(machine.id));
  },
  ["machine-inventory"],
  { revalidate: 120, tags: ["machines"] },
);

// Per-request deduplication: same request won't call the cache twice
export const getMachineInventory = cache(getMachineInventoryCached);


export const getMachineSearchIndex = cache(async function getMachineSearchIndex() {
  const machines = await getMachineInventory();

  return machines.map((machine) => ({
    id: machine.id,
    title: machine.title,
    category: machine.category,
    subcategory: machine.subcategory,
    manufacturer: machine.manufacturer,
    model: machine.model,
  } satisfies MachineSearchItem));
});

export const getMachineById = cache(async function getMachineById(id: string) {
  const machines = await getMachineInventory();
  return machines.find((machine) => machine.id === id) ?? null;
});

export const getMachineBySlug = cache(async function getMachineBySlug(slug: string) {
  const { generateMachineSlug } = await import("@/lib/machine-urls");
  const machines = await getMachineInventory();
  return machines.find((machine) => generateMachineSlug(machine) === slug) ?? null;
});

export function deriveMachineCategories(machines: MachineItem[], categories: CategoryRow[]) {
  const counts = new Map<string, number>();
  const specialDealsCount = machines.filter((machine) => machine.isSpecialDeal).length;

  for (const machine of machines) {
    if (machine.categoryId) {
      counts.set(machine.categoryId, (counts.get(machine.categoryId) ?? 0) + 1);
    }
  }

  return categories
    .filter((category) => !category.parent_id)
    .map((category) => {
      const children = categories.filter((item) => item.parent_id === category.id);
      const totalCount =
        category.name.toLowerCase() === "special deals"
          ? specialDealsCount
          : counts.get(category.id) ?? 0;

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

export const getMachineCatalogData = cache(async function getMachineCatalogData() {
  const [categories, machineInventory] = await Promise.all([getCategories(), getMachineInventory()]);

  return {
    categoryRows: categories,
    machineInventory,
    machineCategories: deriveMachineCategories(machineInventory, categories),
  };
});

function compareMachineRecency(left: MachineItem, right: MachineItem) {
  const leftDate = Date.parse(left.updatedAt ?? left.createdAt ?? "") || 0;
  const rightDate = Date.parse(right.updatedAt ?? right.createdAt ?? "") || 0;
  return rightDate - leftDate;
}

export async function getSpecialDeals(limit?: number) {
  const machines = await getMachineInventory();
  const specialDeals = machines
    .filter((machine) => machine.isSpecialDeal)
    .sort(compareMachineRecency);
  const source = specialDeals.length > 0
    ? specialDeals
    : machines.slice(0, limit ?? 4);
  const selectedDeals = typeof limit === "number" ? source.slice(0, limit) : source;

  return selectedDeals.map((machine) => ({
    machineId: machine.id,
    badge: machine.dealBadge ?? machine.category,
    title: machine.title,
    description: machine.dealDescription ?? machine.description,
    category: machine.subcategory ?? machine.category,
    machineType: machine.machineType.toUpperCase(),
    imageSrc: machine.imageSrc,
    imageAlt: machine.imageAlt,
    imagePosition: machine.imagePosition,
    images: machine.images?.length ? machine.images : [machine.imageSrc],
    imagePositions: machine.imagePositions,
    specifications: machine.specifications ?? [],
  }));
}




