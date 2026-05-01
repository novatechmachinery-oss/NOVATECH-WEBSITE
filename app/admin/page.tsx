import type { Metadata } from "next";

import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Novatech Admin Panel",
  description: "Local admin dashboard for machines, categories, and inventory management.",
};

export default function AdminPage() {
  return <AdminPanel />;
}
