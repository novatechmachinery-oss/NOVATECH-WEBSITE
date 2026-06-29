import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  clearAdminAuthCookies,
  clearLegacyAdminCookie,
  isAdminConfigured,
  isAllowedAdminEmail,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getSupabaseConfig } from "@/lib/supabase";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

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

  const { url, anonKey, storageKey } = getSupabaseConfig();

  // Step 1: Try signing in directly first.
  // IMPORTANT: We do NOT update the password on every login because updateUserById()
  // invalidates ALL existing sessions for that user â€” meaning any other logged-in
  // admin would be immediately kicked out. We only sync the password when sign-in
  // fails (i.e. the Supabase password is out of sync with .env).
  const plainClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let signInData = null;
  let signInError = null;

  const result = await plainClient.auth.signInWithPassword({
    email: submittedEmail,
    password: submittedPassword,
  });
  signInData = result.data;
  signInError = result.error;

  // Step 2: If sign-in failed, it likely means the Supabase user doesn't exist yet
  // or the password in Supabase is out of sync with .env. Sync it now, then retry.
  if (signInError || !signInData?.session) {
    console.log("[admin/login] Direct sign-in failed, syncing password via service role...");

    const adminClient = createClient(url, storageKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: listData } = await adminClient.auth.admin.listUsers();
    const existingUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === submittedEmail,
    );

    if (existingUser) {
      // Sync password â€” only happens when .env password changed or first deploy
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        password: submittedPassword,
      });
    } else {
      // First time: create the user in Supabase
      await adminClient.auth.admin.createUser({
        email: submittedEmail,
        password: submittedPassword,
        email_confirm: true,
      });
    }

    // Retry sign-in after sync
    const retry = await plainClient.auth.signInWithPassword({
      email: submittedEmail,
      password: submittedPassword,
    });
    signInData = retry.data;
    signInError = retry.error;
  }

  if (signInError || !signInData?.session) {
    console.error("[admin/login] signInWithPassword error:", signInError?.message ?? "no session");
    return NextResponse.json(
      { error: signInError?.message || "Login failed. Please try again." },
      { status: 401 },
    );
  }

  const { access_token, refresh_token } = signInData.session;

  // Step 3: Build the response and use the SSR client to explicitly call setSession.
  // This guarantees the setAll callback fires and writes the auth cookies to the response.
  const response = NextResponse.json({ message: "Login successful." });

  clearAdminAuthCookies(request, response);
  clearLegacyAdminCookie(response);

  const ssrClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...COOKIE_OPTIONS,
            // Preserve maxAge from Supabase so tokens aren't session-only
            ...(options?.maxAge !== undefined ? { maxAge: options.maxAge } : {}),
          });
        });
      },
    },
  });

  // setSession triggers setAll which writes the cookies to the response
  const { error: setSessionError } = await ssrClient.auth.setSession({
    access_token,
    refresh_token,
  });

  if (setSessionError) {
    console.error("[admin/login] setSession error:", setSessionError.message);
    return NextResponse.json(
      { error: "Session could not be established. Please try again." },
      { status: 500 },
    );
  }

  console.log("[admin/login] Login successful for:", submittedEmail);

  return response;
}
