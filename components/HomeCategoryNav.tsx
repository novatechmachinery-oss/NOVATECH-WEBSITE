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
    // Red category strip wrapper: sits directly under the blue navbar with a light bottom border and shadow.
    <div
      className="border-b border-slate-200 bg-white/95 text-[#16548b] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      {/* Strip spacing: pt-0 keeps red buttons attached to navbar; pb-1 leaves a tiny bottom breathing space. */}
      <div className="w-full px-0 pb-1 pt-0">
        {/* Responsive grid: one column on mobile, two on small screens, four on large desktop; gap-0.5 creates a very thin divider. */}
        <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-4">
          {types.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                // Category button: rectangle shape, red background, optimized text size, tight padding, and active ring.
                className={`group relative flex min-h-14 items-center justify-center overflow-hidden rounded-none border px-2 py-2 text-center text-[1rem] font-black uppercase tracking-[0.03em] text-white transition-all duration-300 sm:min-h-16 sm:px-2.5 sm:text-[1.12rem] lg:px-3 lg:text-[1.24rem] xl:min-h-[4.25rem] xl:text-[1.34rem] ${
                  isActive
                    ? "border-[#8f1a00] bg-[#B82100] shadow-[0_12px_28px_rgba(184,33,0,0.24)] ring-2 ring-[#f3d06a]/55"
                    : "border-[#9f1d00] bg-[#B82100] shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:border-[#7f1700] hover:bg-[#9f1d00] hover:shadow-[0_14px_30px_rgba(184,33,0,0.2)]"
                }`}
              >
                {/* Text span: text-balance improves two-line wrapping; tight line-height uses button space better. */}
                <span className="text-balance leading-[0.98]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
