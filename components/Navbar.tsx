"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "USED MACHINERY", href: "/metal-working-machinery" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-slate-300 bg-white">
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:hidden">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3 transition hover:opacity-95">
          <div className="relative h-12 w-[164px] flex-none">
            <Image src="/images/main-logo.png" alt="Novatech logo" fill sizes="164px" className="object-contain object-left" />
          </div>
          <div className="min-w-0 flex flex-col leading-none">
            <span className="text-[1.45rem] font-bold uppercase tracking-[0.05em] text-slate-900">Novatech</span>
            <span className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-500">
              Machinery
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 flex-none flex-col items-center justify-center gap-1 rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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

      <div className="mx-auto hidden max-w-[1460px] grid-cols-[1.55fr_1fr] items-center gap-6 px-6 py-4 lg:grid xl:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-5 transition hover:opacity-95">
          <div className="relative h-[88px] w-[100px] flex-none xl:h-[96px] xl:w-[100px]">
            <Image
              src="/images/main-logo.png"
              alt="Novatech logo"
              fill
              sizes="(min-width: 1280px) 356px, 320px"
              className="object-contain object-left"
            />
          </div>
          <div className="min-w-0 flex flex-col leading-none">
            <span className="text-[1.45rem] font-black uppercase tracking-[0.05em] text-sky-700 xl:text-[1.7rem]">
              Novatech Machinery Corporation (opc) pvt ltd
            </span>
            <span className="mt-2 text-[0.8rem] uppercase tracking-[0.2em] text-slate-500">
              Built For Performance
            </span>
          </div>
        </Link>

        <div className="flex justify-end">
          <div className="flex items-center gap-5 text-[0.92rem] font-extrabold uppercase tracking-[0.01em] text-slate-700 xl:gap-7">
            {navItems.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap border-b-[3px] pb-2.5 transition duration-300 ${
                    isActive
                      ? "border-sky-600 text-sky-700"
                      : "border-transparent text-slate-700 hover:border-sky-400 hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${menuOpen ? "block" : "hidden"} border-t border-slate-300 bg-white lg:hidden`}>
        <div className="mx-auto w-full max-w-[1460px] space-y-2 px-4 pb-4 pt-3 sm:px-6">
          {navItems.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-4 py-2 text-sm font-semibold transition duration-200 ${
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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
