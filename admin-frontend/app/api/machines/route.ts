import { type NextRequest } from "next/server";
import { machineService } from "@/services/machine.service";
import { CreateMachineSchema } from "@/lib/validation";
import { ok, created, serverError, parseBody } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      subcategory: searchParams.get("subcategory") ?? undefined,
      condition: searchParams.get("condition") ?? undefined,
      stockStatus: searchParams.get("stockStatus") ?? undefined,
      machineType: searchParams.get("machineType") ?? undefined,
    };
    const machines = await machineService.list(filters);
    return ok(machines);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, CreateMachineSchema);
    if (error) return error;
    const machine = await machineService.create(data);
    return created(machine);
  } catch (err) {
    return serverError(err);
  }
}
