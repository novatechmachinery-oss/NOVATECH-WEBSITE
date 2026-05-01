import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/admin-catalog.service";

export async function GET() {
  const dashboard = await getAdminDashboardData();
  return NextResponse.json(dashboard);
}
