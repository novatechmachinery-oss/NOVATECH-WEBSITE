import { type NextRequest, NextResponse } from "next/server";

import { clearLegacyAdminCookie, createAdminSupabaseClient } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Logged out successfully." });
  const supabase = createAdminSupabaseClient(request, response);

  await supabase.auth.signOut();
  clearLegacyAdminCookie(response);

  return response;
}
