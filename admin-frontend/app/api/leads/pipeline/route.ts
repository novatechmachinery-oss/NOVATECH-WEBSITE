import { leadService } from "@/services/lead.service";
import { ok, serverError } from "@/lib/errors";

export async function GET() {
  try {
    const pipeline = await leadService.getPipeline();
    return ok(pipeline);
  } catch (err) {
    return serverError(err);
  }
}
