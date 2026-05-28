import { type NextRequest, NextResponse } from "next/server";

import {
  clearLegacyAdminCookie,
  createAdminSupabaseClient,
  isAdminConfigured,
  isAllowedAdminEmail,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: { email?: string; otp?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const submittedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const submittedOtp = typeof body.otp === "string" ? body.otp.trim() : "";

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin auth is not configured." },
      { status: 500 },
    );
  }

  if (!submittedEmail || !submittedOtp) {
    return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 });
  }

  if (!isAllowedAdminEmail(submittedEmail)) {
    return NextResponse.json({ error: "This email is not authorized for admin access." }, { status: 403 });
  }

  const response = NextResponse.json({ message: "Login successful." });
  const supabase = createAdminSupabaseClient(request, response);
  const { data, error } = await supabase.auth.verifyOtp({
    email: submittedEmail,
    token: submittedOtp,
    type: "email",
  });

  if (error || !data.session || !data.user?.email) {
    return NextResponse.json(
      { error: error?.message || "Invalid or expired verification code." },
      { status: 401 },
    );
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "This email is not authorized for admin access." }, { status: 403 });
  }

  clearLegacyAdminCookie(response);
  return response;
}
