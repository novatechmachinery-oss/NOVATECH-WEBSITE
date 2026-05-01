import { NextResponse } from "next/server";

import { getAdminCatalog } from "@/lib/admin-catalog.service";

export async function GET() {
  const catalog = await getAdminCatalog();
  return NextResponse.json(catalog);
}
