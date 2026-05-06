import { NextResponse } from "next/server";

const COOKIE_NAME = "nv_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function createAdminToken(password: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(password));
  const signatureArray = new Uint8Array(signatureBuffer);

  // Convert to base64url
  let binary = "";
  for (const byte of signatureArray) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function POST(request: Request) {
  let body: { password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const submittedPassword = typeof body.password === "string" ? body.password.trim() : "";
  const correctPassword = (process.env.ADMIN_PASSWORD ?? "").trim();

  if (!correctPassword) {
    return NextResponse.json(
      { error: "Admin password is not configured. Set ADMIN_PASSWORD in .env.local" },
      { status: 500 },
    );
  }

  if (!submittedPassword || submittedPassword !== correctPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const secret = process.env.ADMIN_SESSION_SECRET ?? correctPassword;
  const token = await createAdminToken(correctPassword, secret);

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
