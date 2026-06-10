import { type NextRequest, NextResponse } from "next/server";

import { clearAdminAuthCookies, clearLegacyAdminCookie, createAdminSupabaseClient } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Logged out successfully." });
  const supabase = createAdminSupabaseClient(request, response);

  try {
    await supabase.auth.signOut();
  } catch {
    // A stale or already-removed refresh token should not block local logout cleanup.
  }

  clearAdminAuthCookies(request, response);
  clearLegacyAdminCookie(response);

  return response;
}
