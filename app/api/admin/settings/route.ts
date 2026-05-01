import { NextResponse } from "next/server";

import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings.service";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const settings = await saveSiteSettings(payload);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save settings." },
      { status: 400 },
    );
  }
}
