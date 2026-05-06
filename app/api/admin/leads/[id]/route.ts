import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/admin-catalog.service";
import { deleteLeadRecord } from "@/lib/leads.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteLeadRecord(id);
    const dashboard = await getAdminDashboardData();

    return NextResponse.json(dashboard);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete lead." },
      { status: 400 },
    );
  }
}
