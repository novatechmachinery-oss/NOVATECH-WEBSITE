import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Novatech Admin",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  const adminUrl = (process.env.ADMIN_APP_URL ?? "https://admin.novatechmachinery.in").replace(/\/$/, "");
  redirect(adminUrl);
}
