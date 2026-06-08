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

type NavbarProps = {
  logoSrc?: string;
  logoAlt?: string;
};

export default function Navbar({
  logoSrc = "/images/MAIN%20LOGO.png",
  logoAlt = "Novatech logo",
}: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-[#1f5e95] bg-[#16548b] text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 xl:hidden">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 transition hover:opacity-95">
          <div className="relative h-10 w-[52px] flex-none overflow-hidden sm:h-11 sm:w-[60px] md:h-12 md:w-[68px]">
            <Image src={logoSrc} alt={logoAlt} fill sizes="78px" className="object-contain" />
          </div>
          <div className="min-w-0 flex flex-1 flex-col leading-none text-white">
            <span className="text-[0.64rem] font-black uppercase leading-tight tracking-[0.01em] sm:text-[0.76rem] md:text-[0.9rem]">
              Novatech Machinery Corporation
            </span>
            <span className="mt-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.08em] text-white sm:text-[0.52rem] md:text-[0.56rem]">
              OPC Pvt. Ltd.
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-9 w-9 flex-none flex-col items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 text-white transition duration-300 hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
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

      <div className="mx-auto hidden max-w-[1460px] items-center justify-between gap-6 px-4 py-2 xl:flex xl:px-6">
        {/* Brand block uses only the width it needs so the menu can align cleanly on the right. */}
        <Link href="/" className="flex items-center gap-1.5 transition hover:opacity-95">
          <div className="relative h-[66px] w-[86px] flex-none overflow-hidden xl:h-[74px] xl:w-[98px]">
            <Image src={logoSrc} alt={logoAlt} fill sizes="112px" className="object-contain" />
          </div>
          <div className="min-w-0 flex flex-col leading-none text-white">
            <span className="whitespace-nowrap text-[1.18rem] font-black uppercase tracking-[0.02em] xl:text-[1.42rem]">
              Novatech Machinery Corporation
            </span>
            <span className="mt-1 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-white xl:text-[0.86rem]">
              OPC Pvt. Ltd.
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center justify-end pl-8 xl:pl-12">
          <div className="flex flex-nowrap items-center justify-end gap-3 text-[0.92rem] font-bold uppercase tracking-[0.08em] text-white xl:gap-4">
            {navItems.map((link) => {
              const isActive = isActiveNavItem(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative whitespace-nowrap rounded-full px-4 py-2.5 transition-all duration-300 ${
                    isActive
                      ? "bg-white text-[#16548b] shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
                      : "text-white hover:bg-white hover:text-[#16548b]"
                  }`}
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#f3d06a] transition-all duration-300 ${
                      isActive ? "w-0 opacity-0" : "w-0 opacity-0 group-hover:w-8 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-slate-200 bg-slate-50 transition-all duration-300 ease-out xl:hidden ${
          menuOpen ? "max-h-[360px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-[1460px] space-y-1.5 px-3 pb-3 pt-2.5 sm:px-6">
          {navItems.map((link) => {
            const isActive = isActiveNavItem(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3.5 py-2.5 text-sm font-black uppercase tracking-[0.08em] transition duration-200 ${
                  isActive
                    ? "bg-[#16548b] text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]"
                    : "bg-white text-slate-950 ring-1 ring-slate-200 hover:text-[#16548b]"
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
