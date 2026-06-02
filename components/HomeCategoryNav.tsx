"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HomeCategoryNavProps = {
  types?: Array<{
    id?: string;
    label: string;
    href: string;
  }>;
};

const defaultTypes = [
  { label: "Metal Working Machinery", href: "/metal-working-machinery" },
  { label: "Pharmaceutical Machinery", href: "/pharmaceutical-machinery" },
  { label: "Plastic Machinery", href: "/plastic-machinery" },
  { label: "Textile Machinery", href: "/textile-machinery" },
];

export default function HomeCategoryNav({ types = defaultTypes }: HomeCategoryNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-t border-[#d8e4ef] border-b border-[#c6d6e4] bg-white text-[#16548b] shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-[1460px] px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-2 items-stretch md:flex">
        {types.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex min-h-9 items-center justify-center border-r border-[#d8e4ef] px-3 py-2 text-center text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-[#16548b] transition duration-300 first:border-l first:border-l-[#d8e4ef] md:min-h-10 md:flex-1 md:px-4 md:text-[0.72rem] lg:px-5 lg:text-[0.8rem] ${
                isActive
                  ? "bg-white text-[#16548b] shadow-[inset_0_-2px_0_#16548b]"
                  : "hover:bg-[#f4f8fb] hover:text-[#16548b]"
              }`}
            >
              <span className="text-balance leading-4 md:leading-[1.1]">{item.label}</span>
              <span
                className={`absolute bottom-1.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#16548b] transition-all duration-300 ${
                  isActive ? "w-10 opacity-100" : "w-0 opacity-0 group-hover:w-10 group-hover:opacity-100"
                }`}
              />
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
