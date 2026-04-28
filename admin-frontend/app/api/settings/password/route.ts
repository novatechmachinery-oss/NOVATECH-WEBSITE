import { type NextRequest } from "next/server";
import { settingsService } from "@/services/settings.service";
import { ChangePasswordSchema } from "@/lib/validation";
import { ok, badRequest, serverError, parseBody } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, ChangePasswordSchema);
    if (error) return error;
    await settingsService.changePassword(data.password);
    return ok({ message: "Password updated successfully" });
  } catch (err) {
    return serverError(err);
  }
}
