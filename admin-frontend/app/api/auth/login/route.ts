import { type NextRequest } from "next/server";
import { userService } from "@/services/user.service";
import { LoginSchema } from "@/lib/validation";
import { ok, badRequest, unauthorized, serverError, parseBody } from "@/lib/errors";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, LoginSchema);
    if (error) return error;

    const user = await userService.verifyPassword(data.email, data.password);
    if (!user) return unauthorized("Invalid email or password");

    const token = createSessionToken(user.id, user.role);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return ok({ role: user.role, message: "Login successful" });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return ok({ message: "Logged out" });
  } catch (err) {
    return serverError(err);
  }
}
