import type { MachineItem } from "@/lib/machine-catalog.types";

export function getMachinePath(machine: Pick<MachineItem, "id"> | string) {
  const id = typeof machine === "string" ? machine : machine.id;
  return `/machines/${encodeURIComponent(id)}`;
}
