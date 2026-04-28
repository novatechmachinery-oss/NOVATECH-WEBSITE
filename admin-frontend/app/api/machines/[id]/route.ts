import { type NextRequest } from "next/server";
import { machineService } from "@/services/machine.service";
import { UpdateMachineSchema } from "@/lib/validation";
import { ok, notFound, serverError, parseBody } from "@/lib/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const machine = await machineService.get(id);
    if (!machine) return notFound("Machine not found");
    return ok(machine);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await parseBody(request, UpdateMachineSchema);
    if (error) return error;
    const machine = await machineService.update(id, data as Parameters<typeof machineService.update>[1]);
    return ok(machine);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await machineService.delete(id);
    return ok({ message: "Machine deleted" });
  } catch (err) {
    return serverError(err);
  }
}
