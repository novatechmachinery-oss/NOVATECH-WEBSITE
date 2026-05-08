import type { Metadata } from "next";

import AdminLogin from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Login - Novatech",
  description: "Sign in to access the Novatech admin panel.",
  robots: "noindex, nofollow",
};

export default function StandaloneAdminLoginPage() {
  return <AdminLogin />;
}
