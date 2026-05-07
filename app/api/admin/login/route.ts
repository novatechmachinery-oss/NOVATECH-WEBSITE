import { NextResponse } from "next/server";

import {
  COOKIE_MAX_AGE,
  COOKIE_NAME,
  createAdminToken,
  getAdminCredentials,
  isAdminConfigured,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const submittedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const submittedPassword = typeof body.password === "string" ? body.password.trim() : "";
  const { email: correctEmail, password: correctPassword, secret } = getAdminCredentials();

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local" },
      { status: 500 },
    );
  }

  if (!submittedEmail || !submittedPassword) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (submittedEmail !== correctEmail || submittedPassword !== correctPassword) {
    return NextResponse.json({ error: "Incorrect admin email or password." }, { status: 401 });
  }

  const token = await createAdminToken(correctEmail, correctPassword, secret);
  const response = NextResponse.json({ message: "Login successful." });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
