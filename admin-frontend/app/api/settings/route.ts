import { type NextRequest } from "next/server";
import { settingsService } from "@/services/settings.service";
import { UpdateSettingsSchema } from "@/lib/validation";
import { ok, serverError, parseBody } from "@/lib/errors";

export async function GET() {
  try {
    const settings = await settingsService.get();
    // Never expose the password hash to the client
    return ok({ ...settings, security: { ...settings.security, passwordHash: undefined } });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, UpdateSettingsSchema);
    if (error) return error;
    let result = await settingsService.get();
    if (data.profile) result = await settingsService.updateProfile({ ...data.profile, email: data.profile.email ?? "" });
    if (data.smtp) result = await settingsService.updateSmtp(data.smtp);
    if (data.tracking) result = await settingsService.updateTracking(data.tracking);
    return ok({ ...result, security: { ...result.security, passwordHash: undefined } });
  } catch (err) {
    return serverError(err);
  }
}
