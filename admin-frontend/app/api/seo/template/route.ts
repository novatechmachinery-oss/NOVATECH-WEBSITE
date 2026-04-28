import { type NextRequest } from "next/server";
import { seoService } from "@/services/seo.service";
import { SeoTemplateSchema } from "@/lib/validation";
import { ok, serverError, parseBody } from "@/lib/errors";

export async function GET() {
  try {
    const workspace = await seoService.getWorkspace();
    return ok(workspace.machineTemplate);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, SeoTemplateSchema);
    if (error) return error;
    await seoService.updateTemplate(data);
    return ok({ message: "SEO machine template updated" });
  } catch (err) {
    return serverError(err);
  }
}
