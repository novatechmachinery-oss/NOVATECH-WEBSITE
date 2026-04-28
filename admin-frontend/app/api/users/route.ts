import { type NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { CreateUserSchema } from "@/lib/validation";
import { ok, created, serverError, parseBody } from "@/lib/errors";

export async function GET() {
  try {
    const users = await userService.list();
    return ok(users);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, CreateUserSchema);
    if (error) return error;
    const user = await userService.create({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone,
      role: data.role,
      password: data.password,
    });
    return created(user);
  } catch (err) {
    return serverError(err);
  }
}
