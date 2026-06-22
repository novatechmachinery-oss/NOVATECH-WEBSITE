import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  clearLegacyAdminCookie,
  isAdminConfigured,
  isAllowedAdminEmail,
  verifyAdminPassword,
  LEGACY_COOKIE_NAME,
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

  // Step 1: Use service role to ensure the admin user exists with the correct password.
  const adminClient = createClient(url, storageKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listData } = await adminClient.auth.admin.listUsers();
  const existingUser = listData?.users?.find(
    (u) => u.email?.toLowerCase() === submittedEmail,
  );

  if (existingUser) {
    await adminClient.auth.admin.updateUserById(existingUser.id, {
      password: submittedPassword,
    });
  } else {
    await adminClient.auth.admin.createUser({
      email: submittedEmail,
      password: submittedPassword,
      email_confirm: true,
    });
  }

  // Step 2: Sign in with a plain client (no SSR, no cookie storage) to get the raw session tokens.
  const plainClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: signInData, error: signInError } = await plainClient.auth.signInWithPassword({
    email: submittedEmail,
    password: submittedPassword,
  });

  if (signInError || !signInData.session) {
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

  // Clear legacy cookie
  response.cookies.set(LEGACY_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });

  const ssrClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        console.log(
          "[admin/login] setAll called with",
          cookiesToSet.length,
          "cookies:",
          cookiesToSet.map((c) => c.name).join(", "),
        );
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

  const setCookieHeader = response.headers.get("set-cookie");
  console.log("[admin/login] Login successful for:", submittedEmail);
  console.log("[admin/login] Set-Cookie header present:", !!setCookieHeader);
  console.log(
    "[admin/login] Cookies being set:",
    response.cookies.getAll().map((c) => c.name).join(", "),
  );

  return response;
}
