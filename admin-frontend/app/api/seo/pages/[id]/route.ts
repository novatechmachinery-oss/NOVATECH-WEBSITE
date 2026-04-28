import { type NextRequest } from "next/server";
import { seoService } from "@/services/seo.service";
import { UpdateSeoPageSchema } from "@/lib/validation";
import { ok, notFound, serverError, parseBody } from "@/lib/errors";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await parseBody(request, UpdateSeoPageSchema);
    if (error) return error;
    const page = await seoService.updatePage(id, data);
    return ok(page);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await seoService.deletePage(id);
    return ok({ message: "SEO page deleted" });
  } catch (err) {
    return serverError(err);
  }
}
