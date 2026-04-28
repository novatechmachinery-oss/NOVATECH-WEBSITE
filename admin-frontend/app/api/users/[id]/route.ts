import { type NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { UpdateUserSchema } from "@/lib/validation";
import { ok, notFound, serverError, parseBody } from "@/lib/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await userService.get(id);
    if (!user) return notFound("User not found");
    return ok(user);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await parseBody(request, UpdateUserSchema);
    if (error) return error;
    const user = await userService.update(id, {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone,
      role: data.role,
      password: data.password,
    });
    return ok(user);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await userService.delete(id);
    return ok({ message: "User deleted" });
  } catch (err) {
    return serverError(err);
  }
}
