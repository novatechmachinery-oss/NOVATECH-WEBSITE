import type { MachineItem } from "@/lib/machine-catalog.types";

export function generateMachineSlug(machine: Pick<MachineItem, "title" | "id">): string {
  const slug = machine.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 3 ? slug : machine.id;
}

export function getMachinePath(machine: Pick<MachineItem, "id" | "title"> | string) {
  if (typeof machine === "string") {
    // Backward compat: string ID passed directly (e.g. from catalog canonical routes)
    return `/machines/${encodeURIComponent(machine)}`;
  }
  return `/machines/${generateMachineSlug(machine)}`;
}

export function getMachineCatalogPath(
  machine: Pick<
    MachineItem,
    "id" | "category" | "subcategory" | "categorySlug" | "subcategorySlug"
  >,
) {
  const params = new URLSearchParams();

  if (machine.categorySlug ?? machine.category) {
    params.set("category", machine.categorySlug ?? machine.category);
  }

  if (machine.subcategorySlug ?? machine.subcategory) {
    params.set("subcategory", machine.subcategorySlug ?? machine.subcategory ?? "");
  }

  params.set("machine", machine.id);
  return `/used-machinery?${params.toString()}`;
}
