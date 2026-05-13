import { NextResponse } from "next/server";

import { getAdminCatalog } from "@/lib/admin-catalog.service";
import { isBase64Image } from "@/lib/image-storage";
import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

/**
 * POST /api/admin/sync-supabase
 *
 * Pushes the current local admin-catalog.json image URLs to the Supabase
 * machines table using the service role key (bypasses RLS).
 *
 * Run this after image migration to eliminate base64 from Supabase DB,
 * which eliminates the slow catalog reads and AbortError timeouts.
 */
export async function POST() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 400 },
    );
  }

  try {
    const catalog = await getAdminCatalog();
    console.log(`[sync-supabase] Syncing ${catalog.machines.length} machines to Supabase...`);

    let synced = 0;
    let skipped = 0;
    let failed = 0;
    const failedMachines: string[] = [];

    for (const machine of catalog.machines) {
      // Skip machines where images still have base64 (should be 0 after migration)
      if (machine.images.some(isBase64Image)) {
        skipped++;
        continue;
      }

      try {
        await supabaseRest(`machines?id=eq.${machine.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ images: machine.images }),
        });
        synced++;
        console.log(`[sync-supabase] ✓ ${machine.id} (${machine.images.length} URLs)`);
      } catch (error) {
        failed++;
        failedMachines.push(machine.name);
        console.error(`[sync-supabase] ✗ ${machine.id}:`, error instanceof Error ? error.message : error);
      }
    }

    console.log(`[sync-supabase] Done: ${synced} synced, ${skipped} skipped (base64), ${failed} failed`);

    return NextResponse.json({
      message: `Supabase sync complete. ${synced} machines updated, ${failed} failed.`,
      synced,
      skipped,
      failed,
      failedMachines,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[sync-supabase] FATAL:", message);
    return NextResponse.json({ error: `Sync failed: ${message}` }, { status: 500 });
  }
}

/**
 * GET /api/admin/sync-supabase
 *
 * Returns how many machines in local JSON have URL images vs base64.
 */
export async function GET() {
  const catalog = await getAdminCatalog();

  const withBase64 = catalog.machines.filter((m) => m.images.some(isBase64Image));
  const withUrls = catalog.machines.filter(
    (m) => m.images.length > 0 && m.images.every((img) => !isBase64Image(img)),
  );
  const withNoImages = catalog.machines.filter((m) => m.images.length === 0);

  return NextResponse.json({
    totalMachines: catalog.machines.length,
    readyToSync: withUrls.length,
    stillHasBase64: withBase64.length,
    noImages: withNoImages.length,
    syncReady: withBase64.length === 0,
  });
}
