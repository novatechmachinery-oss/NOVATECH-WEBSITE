import { type NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

const LOGIN_PAGE = "/admin/login";
const DISABLE_MAIN_ADMIN_ROUTES = process.env.DISABLE_MAIN_ADMIN_ROUTES === "true";
const ADMIN_APP_URL = (process.env.ADMIN_APP_URL ?? "").trim();
const PUBLIC_ADMIN_API_ROUTES = new Set([
  "/api/admin/login",
  "/api/admin/login/verify",
  "/api/admin/logout",
]);

function getStandaloneAdminUrl(request: NextRequest) {
  if (!ADMIN_APP_URL) {
    return null;
  }

  const targetUrl = new URL(ADMIN_APP_URL);
  const adminPath = request.nextUrl.pathname.replace(/^\/admin/, "") || "/";

  targetUrl.pathname = adminPath;
  targetUrl.search = request.nextUrl.search;

  return targetUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (DISABLE_MAIN_ADMIN_ROUTES) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Admin API is not available on this deployment." }, { status: 404 });
    }

    const adminUrl = getStandaloneAdminUrl(request);
    if (adminUrl) {
      return NextResponse.redirect(adminUrl);
    }

    return new NextResponse("Admin is not available on this deployment.", { status: 404 });
  }

  if (pathname === LOGIN_PAGE || PUBLIC_ADMIN_API_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const admin = await getAuthenticatedAdmin(request, response);

  if (!admin) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access this resource." },
        { status: 401 },
      );
    }

    const loginUrl = new URL(LOGIN_PAGE, request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
