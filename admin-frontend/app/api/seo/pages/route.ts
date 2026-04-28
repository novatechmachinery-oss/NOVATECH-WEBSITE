import { seoService } from "@/services/seo.service";
import { SeoPageSchema } from "@/lib/validation";
import { ok, created, serverError, parseBody } from "@/lib/errors";
import { type NextRequest } from "next/server";

export async function GET() {
  try {
    const pages = await seoService.getPages();
    return ok(pages);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = await seoService.createPage({ path: body.path, pageTitle: body.pageTitle });
    return created(page);
  } catch (err) {
    return serverError(err);
  }
}
