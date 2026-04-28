import { machineService } from "@/services/machine.service";
import { ok, serverError } from "@/lib/errors";

export async function GET() {
  try {
    const stats = await machineService.getDashboardStats();
    return ok(stats);
  } catch (err) {
    return serverError(err);
  }
}
