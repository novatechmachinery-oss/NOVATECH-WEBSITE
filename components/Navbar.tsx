"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "HOME", href: "/" },
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

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCategoriesPage = pathname === "/categories" || pathname?.startsWith("/categories/");

  return (
    <nav
      className={`border-b border-sky-900/30 text-white shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${
        isCategoriesPage ? "bg-transparent" : "bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)]"
      }`}
    >
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:hidden">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3 transition hover:opacity-95">
          <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full border border-white/30 bg-white shadow-md">
            <Image src="/images/main logo.webp" alt="Novatech logo" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0 flex flex-col leading-none">
            <span className="text-[1.08rem] font-black uppercase tracking-[0.04em] text-white">Novatech Machinery</span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sky-100">Corporation (OPC) Pvt. Ltd.</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 flex-none flex-col items-center justify-center gap-1 rounded-md border border-white/25 bg-white/10 text-white transition hover:bg-white/18"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <span className="text-xl leading-none">x</span>
          ) : (
            <>
              <span className="h-0.5 w-5 bg-current" />
              <span className="h-0.5 w-5 bg-current" />
              <span className="h-0.5 w-5 bg-current" />
            </>
          )}
        </button>
      </div>

      <div className="mx-auto hidden max-w-[1460px] grid-cols-[1.2fr_1.7fr] items-center gap-8 px-6 py-5 lg:grid xl:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-5 transition hover:opacity-95">
          <div className="relative h-[68px] w-[68px] flex-none overflow-hidden rounded-full border border-white/30 bg-white shadow-md xl:h-[74px] xl:w-[74px]">
            <Image src="/images/main logo.webp" alt="Novatech logo" fill sizes="88px" className="object-cover" />
          </div>
          <div className="min-w-0 flex flex-col leading-none text-white">
            <span className="text-[1.58rem] font-black uppercase tracking-[0.03em] xl:text-[1.98rem]">
              Novatech Machinery
            </span>
            <span className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sky-100 xl:text-[0.82rem]">
              Corporation (OPC) Private Limited
            </span>
          </div>
        </Link>

        <div className="flex justify-end">
          <div className="flex items-center gap-1 rounded-[999px] bg-white/10 px-4 py-2.5 text-[0.95rem] font-extrabold uppercase tracking-[0.03em] text-white xl:gap-1.5 xl:px-5">
            {navItems.map((link) => {
              const isActive = isActiveNavItem(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2.5 text-white transition duration-300 hover:bg-white/14 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] ${
                    isActive ? "bg-white/16 shadow-none" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${menuOpen ? "block" : "hidden"} border-t border-white/15 bg-sky-900/20 lg:hidden`}>
        <div className="mx-auto w-full max-w-[1460px] space-y-2 px-4 pb-4 pt-3 sm:px-6">
          {navItems.map((link) => {
            const isActive = isActiveNavItem(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition duration-200 ${
                  isActive ? "bg-white/18 text-white" : "text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
