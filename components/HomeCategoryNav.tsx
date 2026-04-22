"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const types = [
  { label: "Metal Working Machinery", href: "/metal-working-machinery" },
  { label: "Pharmaceutical Machinery", href: "/pharmaceutical-machinery" },
  { label: "Plastic Machinery", href: "/plastic-machinery" },
  { label: "Textile Machinery", href: "/textile-machinery" },
];

export default function HomeCategoryNav() {
  const pathname = usePathname();

  return (
    <div className="accent-bg border-t border-white/10">
      <div className="mx-auto max-w-[1460px] px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-2 items-stretch md:flex">
        {types.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-h-12 items-center justify-center border-b-2 border-r border-white/12 px-3 py-3 text-center text-[0.68rem] font-black uppercase tracking-[0.04em] text-white transition even:border-r-0 first:border-l md:min-h-14 md:flex-1 md:px-4 md:text-[0.76rem] lg:px-5 lg:text-[0.95rem] ${
                isActive ? "border-b-white bg-white/12" : "border-b-transparent hover:bg-white/10"
              }`}
            >
              <span className="text-balance leading-4 md:leading-5">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
