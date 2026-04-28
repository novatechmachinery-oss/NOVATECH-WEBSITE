import { type NextRequest } from "next/server";
import { seoService } from "@/services/seo.service";
import { SeoGlobalSchema } from "@/lib/validation";
import { ok, serverError, parseBody } from "@/lib/errors";

export async function GET() {
  try {
    const workspace = await seoService.getWorkspace();
    return ok(workspace.global);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, SeoGlobalSchema);
    if (error) return error;
    await seoService.updateGlobal(data);
    return ok({ message: "Global SEO settings updated" });
  } catch (err) {
    return serverError(err);
  }
}
