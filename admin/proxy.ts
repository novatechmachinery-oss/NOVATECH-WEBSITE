import { type NextRequest, NextResponse } from "next/server";

import { clearAdminAuthCookies, getAuthenticatedAdmin } from "@/lib/admin-auth";

const LOGIN_PAGE = "/login";
const PUBLIC_ADMIN_API_ROUTES = new Set([
  "/api/admin/login",
  "/api/admin/login/verify",
  "/api/admin/logout",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_PAGE || PUBLIC_ADMIN_API_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const admin = await getAuthenticatedAdmin(request, response);

  if (!admin) {
    if (pathname.startsWith("/api/")) {
      const unauthorizedResponse = NextResponse.json(
        { error: "Unauthorized. Please log in to access this resource." },
        { status: 401 },
      );
      clearAdminAuthCookies(request, unauthorizedResponse);
      return unauthorizedResponse;
    }

    const loginUrl = new URL(LOGIN_PAGE, request.url);
    loginUrl.searchParams.set("from", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    clearAdminAuthCookies(request, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/api/admin/:path*"],
};
