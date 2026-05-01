import { NextResponse } from "next/server";

import { getAdminCatalog, upsertAdminCategory } from "@/lib/admin-catalog.service";

export async function GET() {
  const catalog = await getAdminCatalog();
  return NextResponse.json(catalog.categories);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const catalog = await upsertAdminCategory(payload);
    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save category." },
      { status: 400 },
    );
  }
}
