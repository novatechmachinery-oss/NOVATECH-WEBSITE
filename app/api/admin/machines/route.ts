import { NextResponse } from "next/server";

import { getAdminCatalog, upsertAdminMachine } from "@/lib/admin-catalog.service";

export async function GET() {
  const catalog = await getAdminCatalog();
  return NextResponse.json(catalog.machines);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const catalog = await upsertAdminMachine(payload);
    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save machine." },
      { status: 400 },
    );
  }
}
