import { NextResponse } from "next/server";

import { deleteAdminMachine, upsertAdminMachine } from "@/lib/admin-catalog.service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const catalog = await upsertAdminMachine({ ...payload, id });
    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update machine." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const catalog = await deleteAdminMachine(id);
    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete machine." },
      { status: 400 },
    );
  }
}
