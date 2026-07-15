
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase";

const LEGACY_COOKIE_NAME = "nv_admin";
const SUPABASE_COOKIE_PREFIX = "sb-";
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
const AUTH_COOKIE_MARKER = "auth-token";
const AUTH_COOKIE_CHUNK_PATTERN = /\.\d+$/;
const TOKEN_EXPIRY_SKEW_SECONDS = 30;

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

function decodeBase64Url(value: string) {
  const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedValue = normalizedValue.padEnd(Math.ceil(normalizedValue.length / 4) * 4, "=");
  const binaryValue = atob(paddedValue);
  const bytes = Uint8Array.from(binaryValue, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseJsonCookie(value: string) {
  const decodedValue = decodeURIComponent(value);
  const jsonValue = decodedValue.startsWith("base64-")
    ? decodeBase64Url(decodedValue.slice("base64-".length))
    : decodedValue;

  return JSON.parse(jsonValue) as unknown;
}

function getCookieBaseName(name: string) {
  return name.replace(AUTH_COOKIE_CHUNK_PATTERN, "");
}

function getSupabaseAuthCookieValue(cookies: ReturnType<NextRequest["cookies"]["getAll"]>) {
  const groupedCookies = new Map<string, Array<{ name: string; value: string }>>();

  for (const cookie of cookies) {
    if (!cookie.name.startsWith(SUPABASE_COOKIE_PREFIX) || !cookie.name.includes(AUTH_COOKIE_MARKER)) {
      continue;
    }

    const baseName = getCookieBaseName(cookie.name);
    const current = groupedCookies.get(baseName) ?? [];
    current.push(cookie);
    groupedCookies.set(baseName, current);
  }

  for (const group of groupedCookies.values()) {
    const sortedGroup = [...group].sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
    const value = sortedGroup.map((cookie) => cookie.value).join("");

    if (value) {
      return value;
    }
  }

  return null;
}

export function getSafeSupabaseRequestCookies(cookies: ReturnType<NextRequest["cookies"]["getAll"]>) {
  const authCookieValue = getSupabaseAuthCookieValue(cookies);

  if (!authCookieValue) {
    return cookies;
  }

  try {
    parseJsonCookie(authCookieValue);
    return cookies;
  } catch {
    return cookies.filter(
      (cookie) => !(cookie.name.startsWith(SUPABASE_COOKIE_PREFIX) && cookie.name.includes(AUTH_COOKIE_MARKER)),
    );
  }
}

function getSessionAccessToken(session: unknown) {
  if (!session) {
    return null;
  }

  if (Array.isArray(session)) {
    const accessToken = session.find((value): value is string => typeof value === "string" && value.split(".").length === 3);
    return accessToken ?? null;
  }

  if (typeof session === "object") {
    const accessToken = (session as { access_token?: unknown }).access_token;
    return typeof accessToken === "string" ? accessToken : null;
  }

  return null;
}

function getJwtExpiry(accessToken: string) {
  try {
    const [, payload] = accessToken.split(".");
    if (!payload) {
      return null;
    }

    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
    return typeof parsedPayload.exp === "number" ? parsedPayload.exp : null;
  } catch {
    return null;
  }
}

function hasFreshSupabaseSessionCookie(cookies: ReturnType<NextRequest["cookies"]["getAll"]>) {
  const authCookieValue = getSupabaseAuthCookieValue(cookies);

  if (!authCookieValue) {
    return false;
  }

  try {
    const session = parseJsonCookie(authCookieValue);
    const accessToken = getSessionAccessToken(session);

    if (!accessToken) {
      return false;
    }

    const expiresAt = getJwtExpiry(accessToken);
    return expiresAt === null || expiresAt > Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SKEW_SECONDS;
  } catch {
    return false;
  }
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
        return getSafeSupabaseRequestCookies(request.cookies.getAll());
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
    console.warn("[auth] isAdminConfigured() returned false");
    return null;
  }

  const cookies = request.cookies.getAll();
  const sbCookies = cookies.filter((c) => c.name.startsWith("sb-"));
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith("sb-") || c.name === LEGACY_COOKIE_NAME
  );
  const hasAuthHeader = request.headers.get("Authorization")?.startsWith("Bearer ");

  if (!hasAuthCookie && !hasAuthHeader) {
    console.warn("[auth] No auth cookie or header found. sb- cookies:", sbCookies.length, "All cookie names:", cookies.map(c => c.name).join(", "));
    return null;
  }

  // Note: We intentionally do NOT check hasFreshSupabaseSessionCookie() here.
  // Supabase's getUser() will automatically refresh an expired access token
  // using the refresh token. Blocking early on expiry caused 401s during
  // normal use when the access token expired mid-session.

  try {
    const supabase = createAdminSupabaseClient(request, response);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn("[auth] getUser() error:", error.message);
      return null;
    }

    if (!user?.email || !isAllowedAdminEmail(user.email)) {
      console.warn("[auth] getUser() returned user but email not allowed:", user?.email);
      return null;
    }

    return user;
  } catch (e) {
    console.error("[auth] getAuthenticatedAdmin threw:", e);
    return null;
  }
}

export function clearLegacyAdminCookie(response: NextResponse) {
  response.cookies.set(LEGACY_COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export function clearAdminAuthCookies(request: NextRequest, response: NextResponse) {
  const cookieNames = new Set<string>([LEGACY_COOKIE_NAME]);

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith(SUPABASE_COOKIE_PREFIX)) {
      cookieNames.add(cookie.name);
    }
  }

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
  }
}

export { LEGACY_COOKIE_NAME };
