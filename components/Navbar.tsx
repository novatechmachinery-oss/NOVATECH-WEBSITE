"use client";

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

  return (
    // Blue main navigation bar: full-width blue background, bottom border, white text, and subtle shadow.
    <nav
      className="border-b border-[#1f5e95] bg-[#16548b] text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      {/* Mobile/tablet nav header: visible below xl; right-aligns the hamburger button. */}
      <div className="mx-auto flex max-w-[1460px] items-center justify-end px-3 py-1 sm:px-4 md:px-6 xl:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-8 w-8 flex-none flex-col items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 text-white transition duration-300 hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
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

      {/* Desktop nav row: hidden below xl; centers nav links with larger vertical padding for strip height. */}
      <div className="mx-auto hidden max-w-[1460px] items-center justify-center px-4 py-2 xl:flex xl:px-6">
          {/* Link group: nowrap keeps all items in one line; gap controls spacing between menu options. */}
          <div className="flex flex-nowrap items-center justify-center gap-8 text-[1rem] font-black uppercase tracking-[0.08em] text-white xl:gap-10">
            {navItems.map((link) => {
              const isActive = isActiveNavItem(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  // Active link gets a white pill; inactive links turn white on hover.
                  className={`group relative whitespace-nowrap rounded-full px-5 py-2 transition-all duration-300 ${
                    isActive
                      ? "bg-white text-[#16548b] shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
                      : "text-white hover:bg-white hover:text-[#16548b]"
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Small hover underline: grows only on inactive nav links. */}
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

      {/* Mobile dropdown menu: max-height and opacity create the open/close animation below xl. */}
      <div
        className={`overflow-hidden border-t border-slate-200 bg-slate-50 transition-all duration-300 ease-out xl:hidden ${
          menuOpen ? "max-h-[360px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Mobile links: stacked buttons with active blue background and inactive white cards. */}
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
