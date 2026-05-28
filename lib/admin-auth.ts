import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase";

const LEGACY_COOKIE_NAME = "nv_admin";
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

type AdminCredentials = {
  email: string;
  emails: string[];
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAdminEmails() {
  const emails = [
    ...(process.env.ADMIN_EMAILS ?? "").split(","),
    process.env.ADMIN_EMAIL ?? "",
  ]
    .map(normalizeEmail)
    .filter(Boolean);

  return Array.from(new Set(emails));
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
}

export function getAdminCredentials(): AdminCredentials {
  const emails = parseAdminEmails();
  const password = (process.env.ADMIN_PASSWORD ?? "").trim();

  return {
    email: emails[0] ?? "",
    emails,
    password,
  };
}

export function isAdminConfigured() {
  const { emails, password } = getAdminCredentials();
  return Boolean(emails.length && password && hasSupabaseConfig());
}

export function isAllowedAdminEmail(email: string) {
  return getAdminCredentials().emails.includes(normalizeEmail(email));
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminCredentials().password;
  return Boolean(configuredPassword) && constantTimeEqual(password, configuredPassword);
}

export function createAdminSupabaseClient(request: NextRequest, response: NextResponse) {
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookieOptions: COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, {
            ...options,
            ...COOKIE_OPTIONS,
          });
        });
      },
    },
  });
}

export async function getAuthenticatedAdmin(
  request: NextRequest,
  response: NextResponse,
): Promise<User | null> {
  if (!isAdminConfigured()) {
    return null;
  }

  try {
    const supabase = createAdminSupabaseClient(request, response);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.email || !isAllowedAdminEmail(user.email)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function clearLegacyAdminCookie(response: NextResponse) {
  response.cookies.set(LEGACY_COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export { LEGACY_COOKIE_NAME };
