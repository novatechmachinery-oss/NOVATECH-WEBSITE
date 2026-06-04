import { NextResponse } from "next/server";

import { getAdminCatalog, saveAdminCatalog } from "@/lib/admin-catalog.service";
import type { AdminMachine } from "@/lib/admin-catalog.types";
import { isBase64Image, uploadBase64ImageToStorage } from "@/lib/image-storage";
import { ensureStorageBucket, hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 400 },
    );
  }

  try {
    // ── Step 1: Load catalog ──────────────────────────────────────────────
    console.log("[migration] Loading catalog...");
    const catalog = await getAdminCatalog();
    console.log(`[migration] Catalog loaded: ${catalog.machines.length} machines`);

    // ── Step 2: Ensure bucket ─────────────────────────────────────────────
    console.log("[migration] Checking storage bucket...");
    await ensureStorageBucket("machine-images");
    console.log("[migration] Bucket ready");

    // ── Step 3: Find machines with base64 images ──────────────────────────
    const machinesWithBase64 = catalog.machines.filter((machine) =>
      machine.images.some(isBase64Image),
    );
    console.log(`[migration] Machines needing migration: ${machinesWithBase64.length}`);

    if (machinesWithBase64.length === 0) {
      return NextResponse.json({
        message: "No base64 images found. Migration is already complete.",
        totalMachines: catalog.machines.length,
        migratedCount: 0,
        failedMachines: [],
      });
    }

    // ── Step 4: Process in batches ────────────────────────────────────────
    const migrationResults: {
      machineId: string;
      machineName: string;
      imagesProcessed: number;
      imagesFailed: number;
      failedIndexes: number[];
    }[] = [];

    const batches: AdminMachine[][] = [];
    for (let i = 0; i < machinesWithBase64.length; i += BATCH_SIZE) {
      batches.push(machinesWithBase64.slice(i, i + BATCH_SIZE));
    }

    const machineMap = new Map(
      catalog.machines.map((m) => [m.id, { ...m, images: [...m.images] }]),
    );

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[migration] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} machines)`);

      const batchPromises = batch.map(async (machine) => {
        const result = {
          machineId: machine.id,
          machineName: machine.name,
          imagesProcessed: 0,
          imagesFailed: 0,
          failedIndexes: [] as number[],
        };

        const updatedImages = [...machine.images];

        for (let i = 0; i < updatedImages.length; i++) {
          if (!isBase64Image(updatedImages[i])) continue;

          const url = await uploadBase64ImageToStorage(updatedImages[i], machine.id, i, machine.name);

          if (url) {
            updatedImages[i] = url;
            result.imagesProcessed++;
            console.log(`[migration] ✓ machine ${machine.id} image ${i} → ${url}`);
          } else {
            result.imagesFailed++;
            result.failedIndexes.push(i);
          }
        }

        const machineEntry = machineMap.get(machine.id);
        if (machineEntry) machineEntry.images = updatedImages;

        // Sync updated URLs to Supabase DB
        try {
          await supabaseRest(`machines?id=eq.${machine.id}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ images: updatedImages }),
          });
        } catch (error) {
          console.error(`[migration] Failed to update Supabase DB for machine ${machine.id}:`, error);
          result.imagesFailed = updatedImages.length;
          result.failedIndexes = updatedImages.map((_, idx) => idx);
        }

        return result;
      });

      const batchResults = await Promise.all(batchPromises);
      migrationResults.push(...batchResults);

      if (batchIndex < batches.length - 1) {
        await delay(BATCH_DELAY_MS);
      }
    }

    // ── Step 5: Save updated catalog JSON ─────────────────────────────────
    const updatedMachines = catalog.machines.map((machine) => {
      const updated = machineMap.get(machine.id);
      return updated ?? machine;
    });

    await saveAdminCatalog({
      ...catalog,
      machines: updatedMachines,
      lastSyncedAt: new Date().toISOString(),
    });

    const totalProcessed = migrationResults.reduce((sum, r) => sum + r.imagesProcessed, 0);
    const totalFailed = migrationResults.reduce((sum, r) => sum + r.imagesFailed, 0);
    const failedMachines = migrationResults.filter((r) => r.imagesFailed > 0);

    console.log(`[migration] Done: ${totalProcessed} uploaded, ${totalFailed} failed`);

    return NextResponse.json({
      message: `Migration complete. ${totalProcessed} images uploaded, ${totalFailed} failed.`,
      totalMachines: catalog.machines.length,
      machinesWithBase64: machinesWithBase64.length,
      migratedCount: totalProcessed,
      failedCount: totalFailed,
      failedMachines: failedMachines.map((r) => ({
        machineId: r.machineId,
        machineName: r.machineName,
        failedIndexes: r.failedIndexes,
      })),
    });

  } catch (error) {
    // Surface the actual error so we can see exactly what crashed
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("[migration] FATAL ERROR:", message, stack);
    return NextResponse.json(
      { error: `Migration crashed: ${message}` },
      { status: 500 },
    );
  }
}

/**
 * GET: Check migration status — how many machines still have base64 images.
 */
export async function GET() {
  const catalog = await getAdminCatalog();

  const machinesWithBase64 = catalog.machines.filter((machine) =>
    machine.images.some(isBase64Image),
  );

  const machinesWithUrls = catalog.machines.filter(
    (machine) =>
      machine.images.length > 0 && machine.images.every((img) => !isBase64Image(img)),
  );

  const machinesWithNoImages = catalog.machines.filter(
    (machine) => machine.images.length === 0,
  );

  const totalBase64Images = machinesWithBase64.reduce(
    (sum, m) => sum + m.images.filter(isBase64Image).length,
    0,
  );

  return NextResponse.json({
    totalMachines: catalog.machines.length,
    totalCategories: catalog.categories.length,
    machinesWithBase64Images: machinesWithBase64.length,
    machinesWithUrlImages: machinesWithUrls.length,
    machinesWithNoImages: machinesWithNoImages.length,
    totalBase64ImagesRemaining: totalBase64Images,
    migrationComplete: machinesWithBase64.length === 0,
    base64MachineIds: machinesWithBase64.map((m) => ({ id: m.id, name: m.name })),
  });
}
