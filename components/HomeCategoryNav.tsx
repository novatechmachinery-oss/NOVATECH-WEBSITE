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
    <div className="border-t border-[#c18a10] bg-[linear-gradient(90deg,#a86f05_0%,#c58a10_18%,#e7b93a_50%,#c58a10_82%,#9b6403_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="mx-auto max-w-[1460px] px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-2 items-stretch md:flex">
        {types.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex min-h-10 items-center justify-center border-r border-white/12 px-3 py-2 text-center text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-white transition first:border-l md:min-h-11 md:flex-1 md:px-4 md:text-[0.72rem] lg:px-5 lg:text-[0.82rem] ${
                isActive
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] shadow-[inset_0_-2px_0_rgba(255,255,255,0.45)]"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="text-balance leading-4 md:leading-[1.1]">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
