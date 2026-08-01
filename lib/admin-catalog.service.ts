import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
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
import { isReadOnlyFilesystem, resolveProjectPath } from "@/lib/project-paths";
import { isBase64Image, MACHINE_IMAGES_BUCKET, uploadBase64ImageToStorage } from "@/lib/image-storage";
import { getSupabaseConfig, hasSupabaseConfig, supabaseRest, supabaseRestAdmin, supabaseRestCached, supabaseStorageRemove } from "@/lib/supabase";

const catalogFilePath = resolveProjectPath("data", "admin-catalog.json");
const supabaseCatalogTimeoutMs = 12_000;
const supabaseCatalogCacheMs = 60_000;
const supabaseCatalogFailureCooldownMs = 60_000;
const recentMachineLimit = 8;
let catalogWriteQueue = Promise.resolve();
let supabaseCatalogRead: Promise<AdminCatalogSnapshot | null> | null = null;
let supabaseCatalogCache: { catalog: AdminCatalogSnapshot; expiresAt: number } | null = null;
let supabaseCatalogFailureUntil = 0;
type CatalogReadMode = "fresh" | "cached";

function isDynamicServerUsageError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE",
  );
}
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

function stringifySpecValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (typeof item === "number") return Number.isFinite(item) ? String(item) : "";
        if (typeof item === "boolean") return String(item);
        if (item && typeof item === "object") return JSON.stringify(item);
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

function normalizeSpecKey(parts: string[]) {
  return parts
    .map((part) => normalizeText(part).replace(/[_-]+/g, " ").replace(/\s+/g, " "))
    .filter(Boolean)
    .join(" / ");
}

function flattenSpecEntries(value: unknown, pathParts: string[] = []): Array<[string, string]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const key = normalizeSpecKey(pathParts);
    const normalizedValue = stringifySpecValue(value);
    return key && normalizedValue ? [[key, normalizedValue]] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, childValue]) => {
    const nextPath = [...pathParts, key];

    if (childValue && typeof childValue === "object" && !Array.isArray(childValue)) {
      return flattenSpecEntries(childValue, nextPath);
    }

    const normalizedKey = normalizeSpecKey(nextPath);
    const normalizedValue = stringifySpecValue(childValue);
    return normalizedKey && normalizedValue ? [[normalizedKey, normalizedValue] as [string, string]] : [];
  });
}

function normalizeSpecs(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(flattenSpecEntries(input));
}
function createId() {
  return randomUUID();
}

function compareCreatedAtDesc(left: { createdAt: string }, right: { createdAt: string }) {
  const leftTime = Date.parse(left.createdAt) || 0;
  const rightTime = Date.parse(right.createdAt) || 0;
  return rightTime - leftTime;
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

async function readSupabaseCatalog(readMode: CatalogReadMode = "fresh") {
  if (!hasSupabaseConfig()) {
    return null;
  }

  // Admin reads must bypass the process-local cache. On serverless deployments,
  // a save and the following refresh can hit different instances; reusing a
  // cached snapshot there makes successfully updated fields appear unchanged.
  if (readMode === "fresh") {
    return readSupabaseCatalogUncached("fresh");
  }

  const now = Date.now();

  if (supabaseCatalogCache && supabaseCatalogCache.expiresAt > now) {
    return supabaseCatalogCache.catalog;
  }

  if (supabaseCatalogFailureUntil > now) {
    return null;
  }

  if (supabaseCatalogRead) {
    return supabaseCatalogRead;
  }

  supabaseCatalogRead = readSupabaseCatalogUncached(readMode).finally(() => {
    supabaseCatalogRead = null;
  });

  return supabaseCatalogRead;
}

function refreshSupabaseCatalogCache(snapshot: AdminCatalogSnapshot) {
  supabaseCatalogCache = {
    catalog: snapshot,
    expiresAt: Date.now() + supabaseCatalogCacheMs,
  };
  supabaseCatalogFailureUntil = 0;
}

async function readSupabaseCatalogUncached(readMode: CatalogReadMode) {
  try {
    const categoriesPromise = supabaseCatalogRest<CategoryRow[]>("categories?select=*", readMode);
    const machinesPromise = fetchSupabaseMachineRows(readMode);
    const [categories, machines] = await Promise.all([
      categoriesPromise,
      machinesPromise,
    ]);

    const catalog = {
      categories: seedCategoryRows(categories),
      machines: seedMachineRows(machines),
      lastSyncedAt: new Date().toISOString(),
    } satisfies AdminCatalogSnapshot;

    supabaseCatalogCache = {
      catalog,
      expiresAt: Date.now() + supabaseCatalogCacheMs,
    };

    return catalog;
  } catch (error) {
    if (!isDynamicServerUsageError(error)) {
      console.error("Failed to read admin catalog from Supabase.", error);
    }
    supabaseCatalogFailureUntil = Date.now() + supabaseCatalogFailureCooldownMs;
    return null;
  }
}

async function supabaseCatalogRest<T>(query: string, readMode: CatalogReadMode = "fresh") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), supabaseCatalogTimeoutMs);

  try {
    return readMode === "cached"
      ? await supabaseRestCached<T>(query, 300, { signal: controller.signal })
      : await supabaseRest<T>(query, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSupabaseMachineRows(readMode: CatalogReadMode = "fresh") {
  const pageSize = 250;
  const rows: MachineRow[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await supabaseCatalogRest<MachineRow[]>(
      `machines?select=*&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
      readMode,
    );
    rows.push(...page);

    if (page.length < pageSize) {
      return rows;
    }
  }
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

async function writeCatalogFileAtomic(snapshot: AdminCatalogSnapshot) {
  if (isReadOnlyFilesystem()) {
    console.warn("Skipping local catalog file write on read-only filesystem (Vercel).");
    return;
  }
  await ensureCatalogDir();
  const temporaryPath = `${catalogFilePath}.${process.pid}.${Date.now()}.tmp`;
  const content = `${JSON.stringify(snapshot, null, 2)}\n`;

  await writeFile(temporaryPath, content, "utf8");

  try {
    await rename(temporaryPath, catalogFilePath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function writeCatalogFile(snapshot: AdminCatalogSnapshot) {
  catalogWriteQueue = catalogWriteQueue.then(
    () => writeCatalogFileAtomic(snapshot),
    () => writeCatalogFileAtomic(snapshot),
  );

  return catalogWriteQueue;
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

export async function getAdminCatalog(options: { cache?: "fresh" | "public" } = {}) {
  const supabaseCatalog = await readSupabaseCatalog(options.cache === "public" ? "cached" : "fresh");
  if (supabaseCatalog && supabaseCatalog.categories.length > 0) {
    return supabaseCatalog;
  }

  const existing = await readCatalogFile();
  if (existing) {
    return existing;
  }

  const seeded = supabaseCatalog ?? (await buildSeedCatalog());
  await writeCatalogFile(seeded);
  return seeded;
}

export async function saveAdminCatalog(snapshot: AdminCatalogSnapshot) {
  await writeCatalogFile(snapshot);
  refreshSupabaseCatalogCache(snapshot);
  return snapshot;
}

export async function upsertAdminCategory(input: AdminCategoryInput) {
  const catalog = await getAdminCatalog();
  const normalized = validateCategoryInput(input, catalog.categories);
  const now = new Date().toISOString();

  let categories = catalog.categories;
  const isUpdate = Boolean(input.id);
  const newId = input.id || createId();

  const newCategory: AdminCategory = {
    id: newId,
    createdAt: isUpdate ? (categories.find(c => c.id === input.id)?.createdAt ?? now) : now,
    updatedAt: now,
    ...normalized,
  };

  if (isUpdate) {
    categories = categories.map((item) => (item.id === newId ? newCategory : item));
  } else {
    categories = [newCategory, ...categories];
  }

  if (hasSupabaseConfig()) {
    try {
      await supabaseRestAdmin("categories", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates, return=minimal" },
        body: JSON.stringify([{
          id: newCategory.id,
          name: newCategory.name,
          slug: newCategory.slug,
          description: newCategory.description ?? null,
          parent_id: newCategory.parentId ?? null,
          created_at: newCategory.createdAt
        }])
      });
    } catch (error) {
      console.error("Supabase sync failed for category:", error);
    }
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

  if (hasSupabaseConfig()) {
    try {
      await supabaseRestAdmin(`categories?id=in.(${Array.from(relatedIds).join(',')})`, { method: "DELETE" });
    } catch (error) {
      console.error("Supabase sync failed for category deletion:", error);
    }
  }

  return saveAdminCatalog({
    ...catalog,
    categories: catalog.categories.filter((item) => !relatedIds.has(item.id)),
  });
}

function isSafeStoragePath(storagePath: string) {
  const parts = storagePath.split("/");
  return Boolean(storagePath && !storagePath.startsWith("/") && parts.every((part) => part && part !== "." && part !== ".."));
}

function getSupabaseMachineImagePath(imageUrl: string) {
  if (!hasSupabaseConfig()) return null;

  try {
    const { url } = getSupabaseConfig();
    const parsedUrl = new URL(imageUrl);
    const supabaseOrigin = new URL(url).origin;
    if (parsedUrl.origin !== supabaseOrigin) return null;

    const objectPrefix = `/storage/v1/object/public/${MACHINE_IMAGES_BUCKET}/`;
    const renderPrefix = `/storage/v1/render/image/public/${MACHINE_IMAGES_BUCKET}/`;
    const matchedPrefix = parsedUrl.pathname.startsWith(objectPrefix)
      ? objectPrefix
      : parsedUrl.pathname.startsWith(renderPrefix)
        ? renderPrefix
        : null;

    if (!matchedPrefix) return null;

    const storagePath = decodeURIComponent(parsedUrl.pathname.slice(matchedPrefix.length));
    return isSafeStoragePath(storagePath) ? storagePath : null;
  } catch {
    return null;
  }
}

function getLocalPublicImagePath(imageUrl: string) {
  try {
    const pathname = imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
      ? new URL(imageUrl).pathname
      : imageUrl;
    const decodedPath = decodeURIComponent(pathname).replace(/\\/g, "/");
    const localMachineImagePrefixes = ["/images/machines/", "/images/machine-images/", "/machine-images/"];
    if (!localMachineImagePrefixes.some((prefix) => decodedPath.startsWith(prefix))) return null;

    const relativeParts = decodedPath
      .replace(/^\/+/, "")
      .split("/")
      .filter(Boolean);

    if (relativeParts.some((part) => part === "." || part === "..")) return null;

    const publicRoot = resolveProjectPath("public");
    const resolvedPath = path.resolve(publicRoot, ...relativeParts);
    const safeRoot = `${path.resolve(publicRoot)}${path.sep}`;

    return resolvedPath.startsWith(safeRoot) ? resolvedPath : null;
  } catch {
    return null;
  }
}

async function cleanupReplacedMachineImages(removedImages: string[], machinesAfterSave: AdminMachine[]) {
  const referencedImages = new Set(machinesAfterSave.flatMap((machine) => machine.images));
  const unusedImages = Array.from(new Set(removedImages.filter((image) => !referencedImages.has(image))));
  if (unusedImages.length === 0) return;

  const storagePaths = unusedImages
    .map(getSupabaseMachineImagePath)
    .filter((item): item is string => Boolean(item));

  if (storagePaths.length > 0) {
    try {
      await supabaseStorageRemove(MACHINE_IMAGES_BUCKET, storagePaths);
    } catch (error) {
      console.warn("Unable to delete replaced Supabase machine images:", error);
    }
  }

  if (isReadOnlyFilesystem()) return;

  await Promise.all(
    unusedImages.map(async (image) => {
      const localPath = getLocalPublicImagePath(image);
      if (!localPath) return;

      try {
        await unlink(localPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.warn(`Unable to delete replaced local image ${localPath}:`, error);
        }
      }
    }),
  );
}
export async function cleanupUnusedMachineImages(imageUrls: string[]) {
  const catalog = await getAdminCatalog();
  await cleanupReplacedMachineImages(imageUrls, catalog.machines);
}
export async function upsertAdminMachine(input: AdminMachineInput) {
  const catalog = await getAdminCatalog();
  const normalized = validateMachineInput(input, catalog.categories);
  const now = new Date().toISOString();

  let machines = catalog.machines;
  const newId = input.id || createId();
  const oldMachine = machines.find((machine) => machine.id === newId);
  const isUpdate = Boolean(oldMachine);

  // Upload any base64 images to Supabase Storage before saving.
  // Images that are already URLs pass through unchanged.
  // If upload fails for an image, keep the original value (do not corrupt the record).
  let resolvedImages = normalized.images;
  if (hasSupabaseConfig() && resolvedImages.some(isBase64Image)) {
    resolvedImages = await Promise.all(
      resolvedImages.map(async (img, index) => {
        if (!isBase64Image(img)) return img;
        const url = await uploadBase64ImageToStorage(img, newId, index, normalized.name);
        return url ?? img; // fallback to original on failure
      }),
    );
  }

  const newMachine: AdminMachine = {
    id: newId,
    createdAt: oldMachine?.createdAt ?? now,
    updatedAt: now,
    ...normalized,
    images: resolvedImages,
  };

  const removedImages = oldMachine
    ? oldMachine.images.filter((image) => !resolvedImages.includes(image))
    : [];

  if (isUpdate) {
    machines = machines.map((item) => (item.id === newId ? newMachine : item));
  } else {
    machines = [newMachine, ...machines];
  }

  if (hasSupabaseConfig()) {
    try {
      await supabaseRestAdmin("machines", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates, return=minimal" },
        body: JSON.stringify([{
          id: newMachine.id,
          name: newMachine.name,
          brand: newMachine.brand ?? null,
          model: newMachine.model ?? null,
          serial_number: newMachine.serialNumber ?? null,
          inventory_number: newMachine.inventoryNumber ?? null,
          country_of_origin: newMachine.countryOfOrigin ?? null,
          price: newMachine.price ?? null,
          condition: newMachine.condition,
          stock_status: newMachine.stockStatus,
          machine_type: newMachine.machineType,
          description: newMachine.description ?? null,
          category_id: newMachine.categoryId,
          special_deal: newMachine.specialDeal,
          featured: newMachine.specialDeal,
          images: newMachine.images,
          specifications: newMachine.specifications,
          created_at: newMachine.createdAt
        }])
      });
    } catch (error) {
      console.error("Supabase sync failed for machine:", error);
      throw new Error(
        error instanceof Error
          ? `Machine could not be saved to Supabase: ${error.message}`
          : "Machine could not be saved to Supabase.",
      );
    }
  }

  const savedCatalog = await saveAdminCatalog({ ...catalog, machines });
  await cleanupReplacedMachineImages(removedImages, savedCatalog.machines);
  return savedCatalog;
}

export async function deleteAdminMachine(id: string) {
  const catalog = await getAdminCatalog();
  const removedMachine = catalog.machines.find((machine) => machine.id === id);
  let canDeleteStoredImages = !hasSupabaseConfig();

  if (hasSupabaseConfig()) {
    try {
      await supabaseRestAdmin(`machines?id=eq.${id}`, { method: "DELETE" });
      canDeleteStoredImages = true;
    } catch (error) {
      console.error("Supabase sync failed for machine deletion:", error);
    }
  }

  const savedCatalog = await saveAdminCatalog({
    ...catalog,
    machines: catalog.machines.filter((item) => item.id !== id),
  });

  if (removedMachine && canDeleteStoredImages) {
    await cleanupReplacedMachineImages(removedMachine.images, savedCatalog.machines);
  }

  return savedCatalog;
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
    .sort(compareCreatedAtDesc);

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
      .sort(compareCreatedAtDesc)
      .slice(0, recentMachineLimit),
    machinesAddedToday: todayMachines.length,
    todayMachines: todayMachines.slice(0, 6),
    recentLeads: leads.slice(0, 6).map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      machineInterested: lead.machineInterested,
      message: lead.message,
      createdAt: lead.createdAt,
    })),
  } satisfies AdminDashboardData;
}

export function buildCategoryIndex(categories: AdminCategory[]) {
  return new Map(categories.map((item) => [item.id, item]));
}
