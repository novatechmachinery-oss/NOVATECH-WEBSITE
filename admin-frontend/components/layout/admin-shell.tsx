import { ReactNode } from "react";
import AdminHeader from "@/components/layout/admin-header";
import AdminSidebar from "@/components/layout/admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function AdminShell({ children, title, description, actions }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title={title} description={description} actions={actions} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
