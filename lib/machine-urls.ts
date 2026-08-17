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
