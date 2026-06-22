import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import {
  clearLegacyAdminCookie,
  createAdminSupabaseClient,
  isAdminConfigured,
  isAllowedAdminEmail,
  verifyAdminPassword,
  getAdminCredentials,
} from "@/lib/admin-auth";
import { getSupabaseConfig } from "@/lib/supabase";

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

  // Use service role to ensure the admin user exists in Supabase with the correct password.
  // This keeps Supabase in sync with the .env credentials so password login always works.
  const { url, storageKey } = getSupabaseConfig();
  const adminClient = createClient(url, storageKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Try to find the existing user by email
  const { data: listData } = await adminClient.auth.admin.listUsers();
  const existingUser = listData?.users?.find(
    (u) => u.email?.toLowerCase() === submittedEmail,
  );

  if (existingUser) {
    // Update password to keep it in sync with .env
    await adminClient.auth.admin.updateUserById(existingUser.id, {
      password: submittedPassword,
    });
  } else {
    // Create the user in Supabase if it doesn't exist yet
    await adminClient.auth.admin.createUser({
      email: submittedEmail,
      password: submittedPassword,
      email_confirm: true,
    });
  }

  // Now sign in with email+password to get a real Supabase session (sets auth cookies)
  const response = NextResponse.json({ message: "Login successful." });
  const supabase = createAdminSupabaseClient(request, response);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: submittedEmail,
    password: submittedPassword,
  });

  if (signInError) {
    console.error("[admin/login] signInWithPassword error:", signInError.message, signInError.status);
    return NextResponse.json(
      { error: signInError.message || "Login failed. Please try again." },
      { status: 401 },
    );
  }

  if (!signInData.session) {
    console.error("[admin/login] signInWithPassword returned no session");
    return NextResponse.json({ error: "Login failed: no session returned." }, { status: 401 });
  }

  // Log what cookies were set so we can debug in Vercel logs
  const setCookieHeader = response.headers.get("set-cookie");
  console.log("[admin/login] Login successful for:", submittedEmail);
  console.log("[admin/login] Set-Cookie header present:", !!setCookieHeader);
  console.log("[admin/login] Session expires_at:", signInData.session.expires_at);

  clearLegacyAdminCookie(response);
  return response;
}
