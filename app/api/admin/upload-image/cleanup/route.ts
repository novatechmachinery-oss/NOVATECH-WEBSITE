import { NextResponse } from "next/server";

import { cleanupUnusedMachineImages } from "@/lib/admin-catalog.service";

type CleanupRequest = {
  urls?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CleanupRequest;
    const urls = Array.isArray(body.urls)
      ? body.urls.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

    if (urls.length > 0) {
      await cleanupUnusedMachineImages(urls);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pending image cleanup failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pending image cleanup failed." },
      { status: 500 },
    );
  }
}