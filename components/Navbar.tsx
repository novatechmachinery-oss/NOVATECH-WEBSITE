"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import HeaderSearch from "./HeaderSearch";
import type { MachineItem } from "@/lib/machines";

const navItems = [
  { label: "HOME", href: "/", icon: Home },
  { label: "USED MACHINERY", href: "/used-machinery" },
  { label: "CATEGORIES", href: "/categories" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT US", href: "/contact" },
];

function isActiveNavItem(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/used-machinery") {
    return (
      pathname === "/used-machinery" ||
      pathname.startsWith("/used-machinery/") ||
      pathname === "/metal-working-machinery" ||
      pathname.startsWith("/metal-working-machinery/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavbarProps = {
  machines: MachineItem[];
};

export default function Navbar({ machines }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="hidden border-b border-[#0b2b49] bg-[linear-gradient(90deg,#071a33_0%,#0c2746_24%,#0f2e52_52%,#0b2440_100%)] text-white shadow-[0_10px_26px_rgba(2,12,27,0.28)] min-[1440px]:block"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      <div className="mx-auto hidden h-[50px] w-full max-w-[1600px] items-center justify-between gap-5 px-4 min-[1440px]:flex min-[1440px]:px-8">
        <div className="flex items-center gap-1.5 text-[0.82rem] font-black uppercase tracking-[0.005em] text-white">
          {navItems.map((link) => {
            const isActive = isActiveNavItem(pathname, link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-[34px] items-center gap-2 rounded-[5px] px-4 transition ${
                  isActive
                    ? "bg-[linear-gradient(180deg,#2e76c2_0%,#1b5ca1_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(2,12,27,0.22)]"
                    : "text-white hover:bg-white/8"
                }`}
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <HeaderSearch machines={machines} />
      </div>

    </nav>
  );
}
