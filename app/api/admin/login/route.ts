import { type NextRequest, NextResponse } from "next/server";

import {
  clearLegacyAdminCookie,
  createAdminSupabaseClient,
  isAdminConfigured,
  isAllowedAdminEmail,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const submittedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const submittedPassword = typeof body.password === "string" ? body.password.trim() : "";

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Admin auth is not configured. Set ADMIN_PASSWORD, ADMIN_EMAIL or ADMIN_EMAILS, and Supabase env variables.",
      },
      { status: 500 },
    );
  }

  if (!submittedEmail || !submittedPassword) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (!isAllowedAdminEmail(submittedEmail) || !verifyAdminPassword(submittedPassword)) {
    return NextResponse.json({ error: "Incorrect admin email or password." }, { status: 401 });
  }

  const response = NextResponse.json({
    message: "Verification code sent to the admin email.",
    nextStep: "otp",
  });
  const supabase = createAdminSupabaseClient(request, response);
  const { error } = await supabase.auth.signInWithOtp({
    email: submittedEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to send verification code." },
      { status: 400 },
    );
  }

  clearLegacyAdminCookie(response);
  return response;
}
