import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "nv_admin";
const LOGIN_PAGE = "/admin/login";

async function verifyAdminCookie(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) return false;

  const secret = process.env.ADMIN_SESSION_SECRET ?? password;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    // Decode base64url token back to bytes
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const signatureBytes = Uint8Array.from(atob(paddedBase64), (c) => c.charCodeAt(0));
    const messageBytes = encoder.encode(password);

    return await crypto.subtle.verify("HMAC", key, signatureBytes, messageBytes);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === LOGIN_PAGE;
  const isLoginApi = pathname === "/api/admin/login";

  // Allow login page and login API through without auth
  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminCookie(token);

  if (!isAuthenticated) {
    // API routes → return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access this resource." },
        { status: 401 },
      );
    }

    // Admin UI pages → redirect to login
    const loginUrl = new URL(LOGIN_PAGE, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
