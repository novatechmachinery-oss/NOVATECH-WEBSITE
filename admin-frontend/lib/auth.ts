import { NextRequest } from "next/server";
import { unauthorized } from "./errors";

const AUTH_COOKIE = "novatech_admin_session";

/**
 * Simple session token stored in an httpOnly cookie.
 * The token value is just the user's role string signed with a timestamp.
 * For production, replace with a proper JWT library.
 */
export function createSessionToken(userId: string, role: string): string {
  const payload = JSON.stringify({ userId, role, issuedAt: Date.now() });
  return Buffer.from(payload).toString("base64");
}

export function parseSessionToken(
  token: string
): { userId: string; role: string; issuedAt: number } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** Get session from request cookie */
export function getSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

/** Check if the request has a valid admin session. Returns session or null. */
export function requireAuth(request: NextRequest) {
  const session = getSession(request);
  if (!session) return { session: null, error: unauthorized() };
  return { session, error: null };
}

/** Check if session has Super Admin or Admin role */
export function requireAdminRole(request: NextRequest) {
  const { session, error } = requireAuth(request);
  if (error || !session) return { session: null, error: error ?? unauthorized() };

  const adminRoles = ["Super Admin", "Admin"];
  if (!adminRoles.includes(session.role)) {
    return { session: null, error: unauthorized("Admin role required") };
  }
  return { session, error: null };
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;
