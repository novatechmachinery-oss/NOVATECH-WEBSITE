import { type NextRequest } from "next/server";
import { settingsService } from "@/services/settings.service";
import { TestEmailSchema } from "@/lib/validation";
import { ok, serverError, parseBody } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, TestEmailSchema);
    if (error) return error;
    const settings = await settingsService.get();
    const result = await settingsService.sendTestEmail(data.recipientEmail, settings.smtp);
    return ok(result);
  } catch (err) {
    return serverError(err);
  }
}
