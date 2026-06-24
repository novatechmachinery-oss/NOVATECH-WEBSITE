"use client";

import Link from "next/link";
import { Factory, Pill, Settings, Shirt } from "lucide-react";
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
  { label: "Other", href: "/categories" },
];

export default function HomeCategoryNav({ types = defaultTypes }: HomeCategoryNavProps) {
  const pathname = usePathname();
  const resolvedTypes = types.some((item) => item.label.trim().toLowerCase() === "other")
    ? types
    : [...types, { label: "Other", href: "/categories" }];
  const iconMap = {
    "metal working machinery": Settings,
    "pharmaceutical machinery": Pill,
    "plastic machinery": Factory,
    "textile machinery": Shirt,
    other: Settings,
  } as const;

  return (
    <div
      className="border-b border-[#8f0f0f] bg-[linear-gradient(180deg,#cf1616_0%,#bb0f0f_100%)] text-white shadow-[0_12px_24px_rgba(64,5,5,0.18)] lg:h-[57px]"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      <div className="w-full px-0">
        <div className="flex flex-wrap gap-px bg-white/45 lg:h-[57px] lg:flex-nowrap">
          {resolvedTypes.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = iconMap[item.label.trim().toLowerCase() as keyof typeof iconMap] ?? Settings;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex min-h-[46px] items-center justify-center gap-3 overflow-hidden bg-[linear-gradient(180deg,#cf1616_0%,#bb0f0f_100%)] px-3 text-center text-[0.72rem] font-black uppercase tracking-[0.01em] text-white transition min-[390px]:text-[0.78rem] sm:text-[0.82rem] lg:h-full lg:min-h-0 lg:flex-1 lg:text-[0.98rem] ${
                  index < 2 ? "w-[calc(50%-0.5px)]" : "w-[calc(33.333%-0.67px)]"
                } ${
                  isActive
                    ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.18)]"
                    : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.82)] hover:bg-[#c31212]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 lg:h-[1.35rem] lg:w-[1.35rem]" />
                <span className="text-balance leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
