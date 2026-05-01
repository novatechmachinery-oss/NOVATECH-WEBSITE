import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  AdminCatalogSnapshot,
  AdminCategory,
  AdminCategoryInput,
  AdminDashboardData,
  AdminMachine,
  AdminMachineInput,
} from "@/lib/admin-catalog.types";
import { getLeadRecords } from "@/lib/leads.service";
import type { CategoryRow, MachineRow } from "@/lib/machine-catalog.types";
import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

const catalogFilePath = path.join(process.cwd(), "data", "admin-catalog.json");

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const text = normalizeText(value);
  return text || undefined;
}

function normalizeImages(images: unknown) {
  if (!Array.isArray(images)) {
    return [] as string[];
  }

  return images
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSpecs(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>)
      .map(([key, value]) => [normalizeText(key), normalizeText(value)])
      .filter(([key, value]) => key && value),
  );
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureCatalogDir() {
  await mkdir(path.dirname(catalogFilePath), { recursive: true });
}

async function fetchSeedMachines() {
  if (!hasSupabaseConfig()) {
    return [] as MachineRow[];
  }

  try {
    return await supabaseRest<MachineRow[]>("machines?select=*&order=created_at.desc");
  } catch (error) {
    console.error("Failed to fetch machines for admin seed.", error);
    return [] as MachineRow[];
  }
}

async function fetchSeedCategories() {
  if (!hasSupabaseConfig()) {
    return [] as CategoryRow[];
  }

  try {
    return await supabaseRest<CategoryRow[]>("categories?select=*&order=name.asc");
  } catch (error) {
    console.error("Failed to fetch categories for admin seed.", error);
    return [] as CategoryRow[];
  }
}

function seedCategoryRows(rows: CategoryRow[]) {
  const now = new Date().toISOString();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug || slugify(row.name),
    description: row.description ?? undefined,
    parentId: row.parent_id,
    createdAt: row.created_at ?? now,
    updatedAt: row.created_at ?? now,
  })) satisfies AdminCategory[];
}

function seedMachineRows(rows: MachineRow[]) {
  const now = new Date().toISOString();
  return rows
    .filter((row) => normalizeText(row.name) && row.category_id)
    .map((row) => ({
      id: row.id,
      name: normalizeText(row.name),
      brand: optionalText(row.brand),
      model: optionalText(row.model),
      serialNumber: optionalText(row.serial_number),
      inventoryNumber: optionalText(row.inventory_number),
      countryOfOrigin: optionalText(row.country_of_origin),
      price: null,
      condition:
        normalizeText(row.condition).toLowerCase() === "new"
          ? "new"
          : normalizeText(row.condition).toLowerCase() === "refurbished"
            ? "refurbished"
            : "used",
      stockStatus:
        normalizeText(row.stock_status).toLowerCase() === "reserved"
          ? "reserved"
          : normalizeText(row.stock_status).toLowerCase() === "sold"
            ? "sold"
            : normalizeText(row.stock_status).toLowerCase() === "in_maintenance"
              ? "in_maintenance"
              : normalizeText(row.stock_status).toLowerCase() === "in_transit"
                ? "in_transit"
                : "available",
      machineType: normalizeText(row.machine_type).toLowerCase() === "cnc" ? "cnc" : "conventional",
      description: optionalText(row.description),
      categoryId: row.category_id!,
      specialDeal: Boolean(row.special_deal ?? row.featured),
      images: normalizeImages(row.images),
      specifications: normalizeSpecs(row.specifications),
      createdAt: row.created_at ?? now,
      updatedAt: row.created_at ?? now,
    })) satisfies AdminMachine[];
}

async function buildSeedCatalog() {
  const [categories, machines] = await Promise.all([fetchSeedCategories(), fetchSeedMachines()]);

  return {
    categories: seedCategoryRows(categories),
    machines: seedMachineRows(machines),
    lastSyncedAt: new Date().toISOString(),
  } satisfies AdminCatalogSnapshot;
}

async function readCatalogFile() {
  try {
    const content = await readFile(catalogFilePath, "utf8");
    const parsed = JSON.parse(content) as Partial<AdminCatalogSnapshot>;

    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      machines: Array.isArray(parsed.machines) ? parsed.machines : [],
      lastSyncedAt: typeof parsed.lastSyncedAt === "string" ? parsed.lastSyncedAt : null,
    } satisfies AdminCatalogSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function writeCatalogFile(snapshot: AdminCatalogSnapshot) {
  await ensureCatalogDir();
  await writeFile(catalogFilePath, JSON.stringify(snapshot, null, 2), "utf8");
}

function categoryDepth(categories: AdminCategory[], categoryId: string) {
  let depth = 0;
  let current = categories.find((item) => item.id === categoryId);

  while (current?.parentId) {
    depth += 1;
    current = categories.find((item) => item.id === current?.parentId);
  }

  return depth;
}

function validateCategoryInput(input: AdminCategoryInput, categories: AdminCategory[]) {
  const name = normalizeText(input.name);
  if (!name) {
    throw new Error("Category name is required.");
  }

  const parentId = input.parentId ?? null;
  if (parentId && !categories.some((item) => item.id === parentId)) {
    throw new Error("Selected parent category does not exist.");
  }

  if (parentId && categoryDepth(categories, parentId) >= 1) {
    throw new Error("Subcategories can only be created under a top-level category.");
  }

  const normalizedName = name.toLowerCase();
  const duplicate = categories.find(
    (item) =>
      item.id !== input.id &&
      item.parentId === parentId &&
      item.name.trim().toLowerCase() === normalizedName,
  );

  if (duplicate) {
    throw new Error(
      parentId
        ? "This subcategory already exists inside the selected category."
        : "This category name already exists.",
    );
  }

  return {
    name,
    slug: normalizeText(input.slug) || slugify(name),
    description: optionalText(input.description),
    parentId,
  };
}

function validateMachineInput(input: AdminMachineInput, categories: AdminCategory[]) {
  const name = normalizeText(input.name);
  if (!name) {
    throw new Error("Machine name is required.");
  }

  const category = categories.find((item) => item.id === input.categoryId);
  if (!category) {
    throw new Error("Please select a valid category or subcategory.");
  }

  const images = normalizeImages(input.images);

  return {
    name,
    brand: optionalText(input.brand),
    model: optionalText(input.model),
    serialNumber: optionalText(input.serialNumber),
    inventoryNumber: optionalText(input.inventoryNumber),
    countryOfOrigin: optionalText(input.countryOfOrigin),
    price: typeof input.price === "number" && Number.isFinite(input.price) ? input.price : null,
    condition: input.condition ?? "used",
    stockStatus: input.stockStatus ?? "available",
    machineType: input.machineType ?? "conventional",
    description: optionalText(input.description),
    categoryId: input.categoryId,
    specialDeal: Boolean(input.specialDeal),
    images,
    specifications: normalizeSpecs(input.specifications),
  };
}

export async function getAdminCatalog() {
  const existing = await readCatalogFile();
  if (existing) {
    return existing;
  }

  const seeded = await buildSeedCatalog();
  await writeCatalogFile(seeded);
  return seeded;
}

export async function saveAdminCatalog(snapshot: AdminCatalogSnapshot) {
  await writeCatalogFile(snapshot);
  return snapshot;
}

export async function upsertAdminCategory(input: AdminCategoryInput) {
  const catalog = await getAdminCatalog();
  const normalized = validateCategoryInput(input, catalog.categories);
  const now = new Date().toISOString();

  let categories = catalog.categories;

  if (input.id) {
    categories = categories.map((item) =>
      item.id === input.id ? { ...item, ...normalized, updatedAt: now } : item,
    );
  } else {
    categories = [
      {
        id: createId("cat"),
        createdAt: now,
        updatedAt: now,
        ...normalized,
      },
      ...categories,
    ];
  }

  return saveAdminCatalog({ ...catalog, categories });
}

export async function deleteAdminCategory(id: string) {
  const catalog = await getAdminCatalog();
  const children = catalog.categories.filter((item) => item.parentId === id);
  const relatedIds = new Set([id, ...children.map((item) => item.id)]);
  const linkedMachines = catalog.machines.filter((item) => relatedIds.has(item.categoryId));

  if (linkedMachines.length > 0) {
    throw new Error("Delete linked machines first before removing this category.");
  }

  return saveAdminCatalog({
    ...catalog,
    categories: catalog.categories.filter((item) => !relatedIds.has(item.id)),
  });
}

export async function upsertAdminMachine(input: AdminMachineInput) {
  const catalog = await getAdminCatalog();
  const normalized = validateMachineInput(input, catalog.categories);
  const now = new Date().toISOString();

  let machines = catalog.machines;

  if (input.id) {
    machines = machines.map((item) =>
      item.id === input.id ? { ...item, ...normalized, updatedAt: now } : item,
    );
  } else {
    machines = [
      {
        id: createId("machine"),
        createdAt: now,
        updatedAt: now,
        ...normalized,
      },
      ...machines,
    ];
  }

  return saveAdminCatalog({ ...catalog, machines });
}

export async function deleteAdminMachine(id: string) {
  const catalog = await getAdminCatalog();
  return saveAdminCatalog({
    ...catalog,
    machines: catalog.machines.filter((item) => item.id !== id),
  });
}

export async function getAdminDashboardData() {
  const catalog = await getAdminCatalog();
  const leads = await getLeadRecords();
  const topLevelCategories = catalog.categories.filter((item) => !item.parentId);
  const maxMachineCount =
    Math.max(
      1,
      ...topLevelCategories.map((category) => {
        const subIds = catalog.categories
          .filter((item) => item.parentId === category.id)
          .map((item) => item.id);
        return catalog.machines.filter(
          (machine) => machine.categoryId === category.id || subIds.includes(machine.categoryId),
        ).length;
      }),
    ) || 1;

  const categories = topLevelCategories
    .map((category) => {
      const subcategories = catalog.categories.filter((item) => item.parentId === category.id);
      const validCategoryIds = new Set([category.id, ...subcategories.map((item) => item.id)]);
      const machineCount = catalog.machines.filter((item) => validCategoryIds.has(item.categoryId)).length;

      return {
        id: category.id,
        name: category.name,
        machineCount,
        subcategoryCount: subcategories.length,
        barWidth: Math.max(12, Math.round((machineCount / maxMachineCount) * 100)),
      };
    })
    .sort((left, right) => right.machineCount - left.machineCount || left.name.localeCompare(right.name));

  const availableCount = catalog.machines.filter((item) => item.stockStatus === "available").length;
  const specialDeals = catalog.machines.filter((item) => item.specialDeal).length;
  const totalValue = catalog.machines.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayMachines = [...catalog.machines]
    .filter((item) => item.createdAt.slice(0, 10) === today)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return {
    metrics: [
      { label: "Total Machines", value: catalog.machines.length, hint: "All locally managed machines" },
      { label: "Categories", value: topLevelCategories.length, hint: "Top-level groups only" },
      { label: "Subcategories", value: catalog.categories.length - topLevelCategories.length, hint: "Nested machine groups" },
      { label: "Available Stock", value: availableCount, hint: "Ready to show customers" },
      { label: "Special Deals", value: specialDeals, hint: "Highlighted on homepage" },
      { label: "Inventory Value", value: totalValue, hint: "Based on entered price data" },
    ],
    categories,
    recentMachines: [...catalog.machines]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5),
    machinesAddedToday: todayMachines.length,
    todayMachines: todayMachines.slice(0, 6),
    recentLeads: leads.slice(0, 6).map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      machineInterested: lead.machineInterested,
      createdAt: lead.createdAt,
    })),
  } satisfies AdminDashboardData;
}

export function buildCategoryIndex(categories: AdminCategory[]) {
  return new Map(categories.map((item) => [item.id, item]));
}
