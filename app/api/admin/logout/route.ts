import { NextResponse } from "next/server";

const COOKIE_NAME = "nv_admin";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
