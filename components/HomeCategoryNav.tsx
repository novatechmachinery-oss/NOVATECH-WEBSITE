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
  { label: "Carbide Scrap", href: "/carbide-scrap" },
];

export default function HomeCategoryNav({ types = defaultTypes }: HomeCategoryNavProps) {
  const pathname = usePathname();
  const normalizedTypes = types.map((item) =>
    item.label.trim().toLowerCase() === "carbide scrap"
      ? { ...item, href: "/carbide-scrap" }
      : item
  );
  const resolvedTypes = normalizedTypes.some(
    (item) => item.label.trim().toLowerCase() === "carbide scrap"
  )
    ? normalizedTypes
    : [...normalizedTypes, { label: "Carbide Scrap", href: "/carbide-scrap" }];
  const carbideScrapType = resolvedTypes.find(
    (item) => item.label.trim().toLowerCase() === "carbide scrap"
  );
  const desktopTypes = carbideScrapType
    ? resolvedTypes.flatMap((item) => {
        const normalizedLabel = item.label.trim().toLowerCase();

        if (normalizedLabel === "metal working machinery") {
          return [item, carbideScrapType];
        }

        return normalizedLabel === "carbide scrap" ? [] : [item];
      })
    : resolvedTypes;
  const iconMap = {
    "metal working machinery": Settings,
    "pharmaceutical machinery": Pill,
    "plastic machinery": Factory,
    "textile machinery": Shirt,
    other: Settings,
    "carbide scrap": Settings,
  } as const;

  return (
    <div
      className="hidden border-b border-[#E32636] bg-[#E32636] text-white shadow-[0_12px_24px_rgba(64,5,5,0.12)] md:block md:h-[42px]"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      <div className="w-full px-0">
        <div className="flex flex-wrap gap-px bg-white/45 md:h-[42px] md:flex-nowrap">
          {desktopTypes.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = iconMap[item.label.trim().toLowerCase() as keyof typeof iconMap] ?? Settings;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex min-h-[38px] items-center justify-center gap-1.5 overflow-hidden bg-[#E32636] px-1.5 text-center text-[0.66rem] font-black uppercase tracking-[0.01em] text-white transition-[filter,box-shadow] duration-300 min-[390px]:min-h-[40px] min-[390px]:gap-2 min-[390px]:px-2 min-[390px]:text-[0.72rem] min-[414px]:min-h-[42px] min-[414px]:gap-3 min-[414px]:px-3 min-[414px]:text-[0.78rem] sm:text-[0.82rem] md:h-full md:min-h-0 md:flex-1 md:text-[0.84rem] lg:text-[0.9rem] ${
                  index < 2 ? "w-[calc(50%-0.5px)]" : "w-[calc(33.333%-0.67px)]"
                } ${
                  isActive
                    ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.18)]"
                    : "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)] hover:brightness-105 focus-visible:brightness-105"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 min-[414px]:h-5 min-[414px]:w-5 lg:h-5 lg:w-5" />
                <span className="text-balance leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
