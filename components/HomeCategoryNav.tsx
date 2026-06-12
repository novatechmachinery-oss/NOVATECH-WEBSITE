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
    <div
      className="border-b border-[#d3dfeb] bg-white text-[#16548b] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      <div className="w-full py-0.5">
        <div className="grid grid-cols-2 gap-[1px] bg-[#dbe5ef] md:grid-cols-4">
        {types.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex min-h-12 items-center justify-center bg-white px-2 py-2 text-center text-[0.86rem] font-black uppercase tracking-[0.03em] text-[#16548b] transition duration-300 sm:text-[0.96rem] md:min-h-12 md:px-3 md:text-[1.05rem] lg:min-h-12 lg:px-4 lg:text-[1.16rem] xl:flex-1 xl:px-5 xl:text-[1.28rem] ${
                isActive
                  ? "text-[#16548b]"
                  : "hover:bg-[#16548b] hover:text-white"
              }`}
            >
              <span className="text-balance leading-none lg:leading-[1.1]">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
