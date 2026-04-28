import { type NextRequest } from "next/server";
import { machineService } from "@/services/machine.service";
import { settingsService } from "@/services/settings.service";
import { ok, badRequest, serverError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const snapshot = await request.json();
    let importedSomething = false;

    if (Array.isArray(snapshot.machines) && snapshot.machines.length > 0) {
      // Import machines one by one (skip duplicates)
      for (const m of snapshot.machines) {
        try {
          await machineService.create({
            name: m.name,
            brand: m.brand ?? "",
            model: m.model ?? "",
            serialNumber: m.serialNumber ?? "",
            countryOfOrigin: m.countryOfOrigin ?? "",
            price: m.price ?? 0,
            category: m.category ?? "",
            subcategory: m.subcategory ?? "",
            condition: m.condition ?? "Used",
            stockStatus: m.stockStatus ?? "In Stock",
            machineType: m.machineType ?? "Conventional",
            description: m.description ?? "",
            specificationsText: (m.specifications ?? []).map((s: { key: string; value: string }) => `${s.key}:${s.value}`).join(", "),
            imagesText: (m.images ?? []).join(", "),
          });
          importedSomething = true;
        } catch {
          // Skip duplicate or invalid machine
        }
      }
    }

    if (snapshot.settings && typeof snapshot.settings === "object") {
      await settingsService.get(); // ensure record exists
      if (snapshot.settings.profile) await settingsService.updateProfile(snapshot.settings.profile);
      if (snapshot.settings.smtp) await settingsService.updateSmtp(snapshot.settings.smtp);
      if (snapshot.settings.tracking) await settingsService.updateTracking(snapshot.settings.tracking);
      importedSomething = true;
    }

    if (!importedSomething) return badRequest("No importable data found in snapshot");

    return ok({ message: "Snapshot imported successfully", machinesImported: snapshot.machines?.length ?? 0 });
  } catch (err) {
    return serverError(err);
  }
}
