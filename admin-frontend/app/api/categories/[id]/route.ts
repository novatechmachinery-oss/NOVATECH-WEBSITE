import { type NextRequest } from "next/server";
import { categoryService } from "@/services/category.service";
import { UpdateCategorySchema } from "@/lib/validation";
import { ok, notFound, serverError, parseBody } from "@/lib/errors";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await parseBody(request, UpdateCategorySchema);
    if (error) return error;
    const category = await categoryService.update(id, data);
    return ok(category);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await categoryService.delete(id);
    return ok({ message: "Category deleted" });
  } catch (err) {
    return serverError(err);
  }
}
