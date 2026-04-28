import { type NextRequest } from "next/server";
import { categoryService } from "@/services/category.service";
import { CreateCategorySchema } from "@/lib/validation";
import { ok, created, serverError, parseBody } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "names") {
      const names = await categoryService.getNames();
      return ok(names);
    }
    if (format === "subcategory-map") {
      const map = await categoryService.getSubcategoryMap();
      return ok(map);
    }
    if (format === "top-level") {
      const cats = await categoryService.listTopLevel();
      return ok(cats);
    }

    const categories = await categoryService.listAll();
    return ok(categories);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, CreateCategorySchema);
    if (error) return error;
    const category = await categoryService.create(data);
    return created(category);
  } catch (err) {
    return serverError(err);
  }
}
