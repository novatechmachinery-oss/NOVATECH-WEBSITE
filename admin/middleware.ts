import { type NextRequest, NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

const LOGIN_PAGE = "/login";
const PUBLIC_ADMIN_API_ROUTES = new Set([
  "/api/admin/login",
  "/api/admin/login/verify",
  "/api/admin/logout",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/", "/login", "/api/admin/:path*"],
};
