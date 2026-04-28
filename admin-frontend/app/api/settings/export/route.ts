import { machineService } from "@/services/machine.service";
import { categoryService } from "@/services/category.service";
import { leadService } from "@/services/lead.service";
import { userService } from "@/services/user.service";
import { settingsService } from "@/services/settings.service";
import { ok, serverError } from "@/lib/errors";

export async function GET() {
  try {
    const [machines, categories, subcategoryMap, leads, users, settings] = await Promise.all([
      machineService.list(),
      categoryService.getNames(),
      categoryService.getSubcategoryMap(),
      leadService.list(),
      userService.list(),
      settingsService.get(),
    ]);

    const snapshot = {
      version: "novatech-admin/v1",
      exportedAt: new Date().toISOString(),
      machines,
      categories,
      subcategoryMap,
      leads,
      users,
      settings: { ...settings, security: { ...settings.security, passwordHash: undefined } },
    };

    return new Response(JSON.stringify(snapshot, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="novatech-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
