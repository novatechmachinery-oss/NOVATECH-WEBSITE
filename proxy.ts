import { type NextRequest, NextResponse } from "next/server";

import { clearAdminAuthCookies, getAuthenticatedAdmin } from "@/lib/admin-auth";

const LOGIN_PAGE = "/admin/login";
const DISABLE_MAIN_ADMIN_ROUTES = process.env.DISABLE_MAIN_ADMIN_ROUTES === "true";
const PUBLIC_ADMIN_API_ROUTES = new Set([
  "/api/admin/login",
  "/api/admin/logout",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (DISABLE_MAIN_ADMIN_ROUTES) {
    // Admin panel is fully hidden on the main website — no redirects, no hints
    return new NextResponse(null, { status: 404 });
  }

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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
