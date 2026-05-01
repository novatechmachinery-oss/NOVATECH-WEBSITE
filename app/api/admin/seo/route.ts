import { NextResponse } from "next/server";

import { getSeoSettings, saveSeoSettings } from "@/lib/seo-settings.service";

export async function GET() {
  const settings = await getSeoSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const settings = await saveSeoSettings(payload);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save SEO settings." },
      { status: 400 },
    );
  }
}
