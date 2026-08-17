import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Login - Novatech",
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  const adminUrl = (process.env.ADMIN_APP_URL ?? "https://admin.novatechmachinery.com").replace(/\/$/, "");
  redirect(`${adminUrl}/login`);
}
                         
