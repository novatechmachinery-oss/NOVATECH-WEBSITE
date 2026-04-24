"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", marker: "D" },
  { href: "/machines", label: "Machines", marker: "M" },
  { href: "/inventory", label: "Inventory", marker: "I" },
  { href: "/leads", label: "Leads", marker: "L" },
  { href: "/categories", label: "Categories", marker: "C" },
  { href: "/users", label: "Users", marker: "U" },
  { href: "/seo", label: "SEO", marker: "S" },
  { href: "/settings", label: "Settings", marker: "T" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="brand-block">
        <div className="brand-logo">NM</div>
        <div className="brand-copy">
          <span className="brand-kicker">Admin Workspace</span>
          <strong>Novatech</strong>
        </div>
      </div>

      <p className="sidebar-section-title">Menu</p>

      <nav className="nav-list">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"}>
              <span className="nav-marker">{link.marker}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link href="/login" className="logout-link">
        <span className="nav-marker">X</span>
        <span>Sign Out</span>
      </Link>
    </aside>
  );
}
