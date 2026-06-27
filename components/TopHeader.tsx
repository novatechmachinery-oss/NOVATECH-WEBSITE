"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, Factory, Info, Mail, PhoneCall, Pill, Settings, Shirt, X } from "lucide-react";
import { useRouter } from "next/navigation";

import NewsletterSignup from "./NewsletterSignup";
import type { MachineItem } from "@/lib/machines";

type TopHeaderProps = {
  phonePrimary?: string;
  phoneSecondary?: string;
  logoSrc?: string;
  logoAlt?: string;
  emailAddress?: string;
  machines?: MachineItem[];
  categoryLinks?: Array<{
    id?: string;
    label: string;
    href: string;
  }>;
};

const defaultCategoryLinks = [
  { label: "Metal Working Machinery", href: "/metal-working-machinery" },
  { label: "Pharmaceutical Machinery", href: "/pharmaceutical-machinery" },
  { label: "Plastic Machinery", href: "/plastic-machinery" },
  { label: "Textile Machinery", href: "/textile-machinery" },
  { label: "Carbide Scrap", href: "/categories" },
];

function cleanPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\s+/g, "");
}

function getWhatsAppHref(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}`;
}

function buildMachineHref(machine: MachineItem) {
  const params = new URLSearchParams();

  if (machine.categorySlug ?? machine.category) {
    params.set("category", machine.categorySlug ?? machine.category);
  }

  if (machine.subcategorySlug ?? machine.subcategory) {
    params.set("subcategory", machine.subcategorySlug ?? machine.subcategory ?? "");
  }

  params.set("machine", machine.id);

  return `/used-machinery?${params.toString()}`;
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.38 2.86a2 2 0 0 1-.57 1.67l-1.27 1.27a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 1.67-.57l2.86.38A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      <path d="M12.04 2.25A9.67 9.67 0 0 0 3.7 16.78l-1.08 3.98 4.08-1.07a9.66 9.66 0 0 0 5.34 1.62h.01a9.53 9.53 0 0 0 6.79-2.82 9.62 9.62 0 0 0 2.82-6.82c0-5.19-4.32-9.42-9.62-9.42Zm0 17.42h-.01a8.08 8.08 0 0 1-4.12-1.13l-.29-.17-2.42.63.65-2.35-.19-.31a8.02 8.02 0 1 1 6.38 3.33Zm4.38-6.02c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18a7.2 7.2 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export default function TopHeader({
  phonePrimary = "+91 9646255755",
  phoneSecondary = "+91 9646255855",
  logoSrc = "/images/MAIN%20LOGO.png",
  logoAlt = "Novatech logo",
  emailAddress = "info@novatechmachinery.com",
  machines = [],
  categoryLinks = defaultCategoryLinks,
}: TopHeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setIsDrawerMachineryOpen] = useState(false);
  const [isInlineMachineryOpen, setIsInlineMachineryOpen] = useState(false);
  const [isCompactSearchOpen, setIsCompactSearchOpen] = useState(false);
  const [compactSearchQuery, setCompactSearchQuery] = useState("");
  const [isCompactSuggestionsOpen, setIsCompactSuggestionsOpen] = useState(false);

  const resolvedCategoryLinks = useMemo(
    () =>
      categoryLinks.some((item) => ["other", "carbide scrap"].includes(item.label.trim().toLowerCase()))
        ? categoryLinks
        : [...categoryLinks, { label: "Carbide Scrap", href: "/categories" }],
    [categoryLinks]
  );

  const machineryIconMap = {
    "metal working machinery": Settings,
    "pharmaceutical machinery": Pill,
    "plastic machinery": Factory,
    "textile machinery": Shirt,
    other: Settings,
    "carbide scrap": Settings,
  } as const;

  const compactSearchSuggestions = useMemo(() => {
    const normalizedQuery = compactSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return machines
      .filter((machine) => {
        const haystack = [
          machine.title,
          machine.category,
          machine.subcategory,
          machine.manufacturer,
          machine.model,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [compactSearchQuery, machines]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    setIsCompactSearchOpen(false);
    setIsCompactSuggestionsOpen(false);
    setIsInlineMachineryOpen(false);

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  function openCompactMachineSuggestion(machine: MachineItem) {
    router.push(buildMachineHref(machine));
    setIsCompactSearchOpen(false);
    setCompactSearchQuery("");
    setIsCompactSuggestionsOpen(false);
  }

  function submitCompactSearch() {
    const trimmedQuery = compactSearchQuery.trim();
    if (!trimmedQuery) {
      router.push("/used-machinery");
      setIsCompactSuggestionsOpen(false);
      return;
    }

    router.push(`/used-machinery?q=${encodeURIComponent(trimmedQuery)}`);
    setIsCompactSuggestionsOpen(false);
  }

  const mobileQuickLinkClass =
    "inline-flex min-h-[32px] items-center justify-center px-2 text-center text-[0.66rem] font-black uppercase tracking-[0.02em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] min-[390px]:min-h-[34px] min-[390px]:text-[0.66rem] min-[414px]:min-h-[37px] min-[414px]:text-[0.66rem] bg-[linear-gradient(180deg,#145b93_0%,#0f4f89_100%)]";

  return (
    <div
      className="border-b border-slate-200 bg-[#fff7e6] text-slate-800"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      <div className="grid w-full grid-cols-1 gap-0 px-1.5 py-0.5 text-[0.74rem] min-[414px]:px-2 min-[414px]:py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-5 2xl:grid-cols-[150px_minmax(0,1fr)_300px] 2xl:items-center 2xl:px-6 2xl:py-2">
        <div className="flex min-w-0 max-w-full items-center gap-0 overflow-visible 2xl:contents">
          <Link href="/" className="flex-none transition hover:opacity-95">
            <div className="relative h-[56px] w-[68px] overflow-hidden min-[390px]:h-[60px] min-[390px]:w-[74px] min-[414px]:h-[66px] min-[414px]:w-[84px] sm:h-[74px] sm:w-[98px] md:h-[86px] md:w-[114px] lg:h-[92px] lg:w-[122px] 2xl:h-[108px] 2xl:w-[150px]">
              <Image src={logoSrc} alt={logoAlt} fill sizes="120px" className="object-contain" />
            </div>
          </Link>
          <div className="relative min-w-0 max-w-full flex-1 2xl:flex 2xl:h-[108px] 2xl:flex-col 2xl:justify-start">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((current) => !current);
                setIsDrawerMachineryOpen(false);
                setIsInlineMachineryOpen(false);
              }}
              className="absolute right-0 top-1 inline-flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-white/80 text-[#163d6b] shadow-sm min-[414px]:h-10 min-[414px]:w-10 2xl:hidden"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </button>
            <div
              className="flex min-w-0 max-w-full flex-1 flex-col overflow-visible pl-1 pr-10 text-left leading-[0.98] text-[#163d6b] min-[414px]:pr-12 min-[414px]:leading-[1.01] lg:leading-[1.03] 2xl:justify-start 2xl:pr-4"
              style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
            >
              <span className="block max-w-full whitespace-nowrap text-[0.98rem] font-black uppercase tracking-[0.01em] min-[390px]:text-[1.1rem] min-[414px]:text-[1.18rem] sm:hidden">
                NOVATECH MACHINERY
              </span>
              <span className="block max-w-full whitespace-normal text-[0.98rem] font-black uppercase leading-[0.98] tracking-[0.01em] min-[390px]:text-[1.1rem] min-[414px]:text-[1.18rem] sm:hidden">
                CORPORATION (OPC)
                <br />
                PRIVATE LIMITED
              </span>
              <span className="hidden max-w-full whitespace-normal text-[1.42rem] font-black uppercase tracking-[0.02em] sm:block md:text-[1.78rem] lg:text-[1.92rem] 2xl:whitespace-nowrap 2xl:text-[clamp(2.02rem,calc((64vw-150px)/14.8),2.66rem)]">
                NOVATECH MACHINERY CORPORATION
              </span>
              <div className="mt-0 hidden max-w-full flex-col gap-1 sm:flex">
                <span className="block max-w-full whitespace-normal text-[1.42rem] font-black uppercase tracking-[0.02em] md:text-[1.78rem] lg:text-[1.92rem] 2xl:whitespace-nowrap 2xl:text-[clamp(2.02rem,calc((64vw-150px)/14.8),2.76rem)]">
                  (OPC) PRIVATE LIMITED
                </span>
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="fixed inset-0 z-[9999] 2xl:hidden" aria-modal="true" role="dialog">
            <button
              type="button"
              aria-label="Close mobile menu"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsDrawerMachineryOpen(false);
              }}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]"
            />

            <div className="absolute right-0 top-0 flex h-[100dvh] w-[min(86vw,340px)] max-w-[340px] flex-col overflow-hidden rounded-l-[28px] bg-white shadow-[-18px_0_48px_rgba(15,23,42,0.34)]">
              <div className="border-b border-slate-200 bg-white px-4 pb-4 pt-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">
                      Menu
                    </p>
                    <p className="mt-1 text-[0.92rem] font-black leading-[1.1] text-[#163d6b]">
                      Novatech Machinery
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsDrawerMachineryOpen(false);
                    }}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" strokeWidth={2.4} />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#145b93] text-white">
                      <Mail className="h-4.5 w-4.5" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.64rem] font-black uppercase tracking-[0.12em] text-slate-500">Email</p>
                      <a
                        href={`mailto:${emailAddress}`}
                        className="mt-0.5 block break-all text-[0.8rem] font-black leading-[1.15] text-[#163d6b]"
                      >
                        {emailAddress}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#f7f9fc] px-3 py-3">
                <div className="space-y-3">
                  <NewsletterSignup variant="mobile-full" />

                  <Link
                    href="/contact"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsDrawerMachineryOpen(false);
                    }}
                    className="flex min-h-[46px] items-center gap-3 rounded-xl bg-[linear-gradient(180deg,#145b93_0%,#0f4f89_100%)] px-4 text-[0.78rem] font-black uppercase tracking-[0.03em] text-white transition hover:brightness-105"
                  >
                    <PhoneCall className="h-4.5 w-4.5 shrink-0 text-white" strokeWidth={2.2} />
                    <span className="min-w-0 flex-1">Contact Us</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white" strokeWidth={2.4} />
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsDrawerMachineryOpen(false);
                    }}
                    className="flex min-h-[46px] items-center gap-3 rounded-xl bg-[linear-gradient(180deg,#145b93_0%,#0f4f89_100%)] px-4 text-[0.78rem] font-black uppercase tracking-[0.03em] text-white transition hover:brightness-105"
                  >
                    <Info className="h-4.5 w-4.5 shrink-0 text-white" strokeWidth={2.2} />
                    <span className="min-w-0 flex-1">About Us</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white" strokeWidth={2.4} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="hidden min-w-0 flex-col items-center justify-center gap-2 px-2 pb-1 pt-1 text-sm text-slate-900 2xl:flex 2xl:items-end 2xl:justify-end 2xl:pb-0 2xl:pt-2">
          <div className="hidden shrink-0 2xl:flex">
            <NewsletterSignup variant="desktop" />
          </div>

          <div className="hidden w-full translate-y-4 flex-wrap items-center justify-center gap-x-5 gap-y-2 leading-none 2xl:flex 2xl:flex-nowrap 2xl:justify-end">
            <div className="inline-flex shrink-0 items-center gap-1">
              <a
                href={`tel:${cleanPhoneNumber(phonePrimary)}`}
                aria-label={`Call ${phonePrimary}`}
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100"
              >
                <PhoneIcon />
              </a>
              <a
                href={getWhatsAppHref(phonePrimary)}
                aria-label={`WhatsApp ${phonePrimary}`}
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                <WhatsAppIcon />
              </a>
              <a
                href={`tel:${cleanPhoneNumber(phonePrimary)}`}
                className="whitespace-nowrap text-[0.94rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[1rem] sm:text-[1.08rem] md:text-[1.14rem] lg:text-[1.16rem]"
              >
                {phonePrimary}
              </a>
            </div>

            <div className="inline-flex shrink-0 items-center">
              <a
                href={`tel:${cleanPhoneNumber(phoneSecondary)}`}
                className="whitespace-nowrap text-[0.94rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[1rem] sm:text-[1.08rem] md:text-[1.14rem] lg:text-[1.16rem]"
              >
                {phoneSecondary}
              </a>
            </div>
          </div>

        </div>

        {!isMobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-[#fff7e6] px-0 pb-0 pt-0 min-[414px]:px-0 min-[414px]:pb-0 min-[414px]:pt-0 2xl:hidden">
          {isCompactSearchOpen ? (
            <div className="relative">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitCompactSearch();
                }}
                className="flex h-10 w-full overflow-hidden border border-[#1a4a7a] bg-white"
              >
                <input
                  value={compactSearchQuery}
                  onChange={(event) => {
                    setCompactSearchQuery(event.target.value);
                    setIsCompactSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (compactSearchQuery.trim()) {
                      setIsCompactSuggestionsOpen(true);
                    }
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setIsCompactSuggestionsOpen(false), 120);
                  }}
                  placeholder="Search machines..."
                  className="h-full flex-1 border-0 px-4 text-[0.9rem] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCompactSearchOpen(false);
                    setCompactSearchQuery("");
                    setIsCompactSuggestionsOpen(false);
                  }}
                  className="inline-flex w-10 items-center justify-center border-l border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  aria-label="Close search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="inline-flex w-10 items-center justify-center bg-[#0f4f89] text-white transition hover:bg-[#0c4475]"
                  aria-label="Search machinery"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                </button>
              </form>

              {isCompactSuggestionsOpen && compactSearchSuggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 overflow-hidden border border-slate-200 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.16)]">
                  {compactSearchSuggestions.map((machine) => (
                    <Link
                      key={machine.id}
                      href={buildMachineHref(machine)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        openCompactMachineSuggestion(machine);
                      }}
                      className="flex w-full flex-col items-start gap-1 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-sky-50"
                    >
                      <span className="text-[0.82rem] font-black uppercase leading-tight text-slate-900">
                        {machine.title}
                      </span>
                      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        {[machine.category, machine.subcategory].filter(Boolean).join(" | ")}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_26px] items-center gap-0.5 bg-[#fff7e6] px-1 py-0 min-[414px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_28px] min-[414px]:gap-1 min-[414px]:px-1.5 min-[414px]:py-0">
              <a
                href={`tel:${cleanPhoneNumber(phonePrimary)}`}
                className="min-w-0 inline-flex items-center gap-0.5 whitespace-nowrap text-[0.66rem] font-black leading-none tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[0.7rem] min-[414px]:text-[0.72rem] sm:text-[0.84rem]"
              >
                <span className="inline-flex shrink-0 items-center justify-center text-sky-600">
                  <PhoneIcon />
                </span>
                <span className="truncate">{phonePrimary}</span>
              </a>
              <a
                href={`tel:${cleanPhoneNumber(phoneSecondary)}`}
                className="min-w-0 inline-flex items-center gap-0.5 whitespace-nowrap text-[0.66rem] font-black leading-none tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[0.7rem] min-[414px]:text-[0.72rem] sm:text-[0.84rem]"
              >
                <span className="inline-flex shrink-0 items-center justify-center text-emerald-600">
                  <WhatsAppIcon />
                </span>
                <span className="truncate">{phoneSecondary}</span>
              </a>
              <button
                type="button"
                onClick={() => setIsCompactSearchOpen(true)}
                className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border border-sky-200 bg-sky-50 text-[#145b93] transition hover:border-sky-300 hover:bg-sky-100 min-[414px]:h-[28px] min-[414px]:w-[28px]"
                aria-label="Open machine search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </button>
            </div>
          )}

          <div className="mt-0">
            <div className="grid grid-cols-[0.82fr_1.56fr_1.02fr] gap-1 min-[414px]:grid-cols-[0.84fr_1.6fr_1fr] min-[414px]:gap-2">
              <Link
                href="/"
                onClick={() => {
                  setIsInlineMachineryOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className={mobileQuickLinkClass}
              >
                <span className="truncate">HOME</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsInlineMachineryOpen((current) => !current)}
                className={`${mobileQuickLinkClass} gap-1 min-[414px]:gap-1.5`}
                aria-expanded={isInlineMachineryOpen}
                aria-controls="mobile-machinery-links-inline"
              >
                <span className="truncate">USED MACHINERY</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition ${isInlineMachineryOpen ? "rotate-180" : ""}`}
                  strokeWidth={2.4}
                />
              </button>

              <Link
                href="/categories"
                onClick={() => {
                  setIsInlineMachineryOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className={mobileQuickLinkClass}
              >
                <span className="truncate">CATEGORIES</span>
              </Link>
            </div>

            {isInlineMachineryOpen ? (
              <div id="mobile-machinery-links-inline" className="mt-2 grid grid-cols-1 gap-1 min-[414px]:gap-2">
                {resolvedCategoryLinks.map((item, index) => {
                  const Icon = machineryIconMap[item.label.trim().toLowerCase() as keyof typeof machineryIconMap] ?? Settings;
                  const isLastItem = index === resolvedCategoryLinks.length - 1;

                  return (
                    <div key={`inline-${item.label}-${item.href}`} className="space-y-1 min-[414px]:space-y-2">
                      {isLastItem ? (
                        <p className="px-1 text-[0.58rem] font-black uppercase tracking-[0.16em] text-slate-500">
                          More
                        </p>
                      ) : null}
                      <Link
                        href={item.href}
                        onClick={() => {
                          setIsInlineMachineryOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex min-h-[38px] items-center justify-center gap-2 bg-[linear-gradient(180deg,#cf1616_0%,#bb0f0f_100%)] px-3 text-center text-[0.68rem] font-black uppercase tracking-[0.02em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] min-[414px]:min-h-[42px] min-[414px]:text-[0.76rem]"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-balance leading-none">{item.label}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
