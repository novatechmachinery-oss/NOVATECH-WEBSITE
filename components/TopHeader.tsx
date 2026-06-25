"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import NewsletterSignup from "./NewsletterSignup";
import type { MachineItem } from "@/lib/machines";

type TopHeaderProps = {
  phonePrimary?: string;
  phoneSecondary?: string;
  emailAddress?: string;
  logoSrc?: string;
  logoAlt?: string;
  machines?: MachineItem[];
};

const mobileNavItems = [
  { label: "HOME", href: "/" },
  { label: "USED MACHINERY", href: "/used-machinery" },
  { label: "CATEGORIES", href: "/categories" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT US", href: "/contact" },
];

function cleanPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\s+/g, "");
}

function getWhatsAppHref(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}`;
}

function getEmailComposeHref(emailAddress: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`;
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M21 16.4v2.85a1.75 1.75 0 0 1-1.91 1.74A17.3 17.3 0 0 1 3.01 4.91 1.75 1.75 0 0 1 4.75 3H7.6a1.75 1.75 0 0 1 1.75 1.5l.3 2.42a1.75 1.75 0 0 1-.5 1.48l-1.02 1.02a14 14 0 0 0 6.25 6.25l1.02-1.02a1.75 1.75 0 0 1 1.48-.5l2.42.3A1.75 1.75 0 0 1 21 16.4Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" fill="currentColor" opacity="0.12" />
      <path
        d="M4.75 7.25h14.5c.69 0 1.25.56 1.25 1.25v7c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-7c0-.69.56-1.25 1.25-1.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="m4.5 8 7.5 5.3L19.5 8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m4.8 16.4 5.4-4.3M19.2 16.4l-5.4-4.3" stroke="currentColor" strokeWidth="1.35" opacity="0.72" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12.04 2.25A9.67 9.67 0 0 0 3.7 16.78l-1.08 3.98 4.08-1.07a9.66 9.66 0 0 0 5.34 1.62h.01a9.53 9.53 0 0 0 6.79-2.82 9.62 9.62 0 0 0 2.82-6.82c0-5.19-4.32-9.42-9.62-9.42Zm0 17.42h-.01a8.08 8.08 0 0 1-4.12-1.13l-.29-.17-2.42.63.65-2.35-.19-.31a8.02 8.02 0 1 1 6.38 3.33Zm4.38-6.02c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18a7.2 7.2 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export default function TopHeader({
  phonePrimary = "+91 9646255755",
  phoneSecondary = "+91 9646255855",
  emailAddress = "info@novatechmachinery.com",
  logoSrc = "/images/MAIN%20LOGO.png",
  logoAlt = "Novatech logo",
  machines = [],
}: TopHeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompactSearchOpen, setIsCompactSearchOpen] = useState(false);
  const [compactSearchQuery, setCompactSearchQuery] = useState("");
  const [isCompactSuggestionsOpen, setIsCompactSuggestionsOpen] = useState(false);

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
              onClick={() => setIsMobileMenuOpen((current) => !current)}
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
              <span className="block max-w-full whitespace-nowrap text-[0.98rem] font-black uppercase tracking-[0.01em] min-[390px]:text-[1.1rem] min-[414px]:text-[1.18rem] sm:hidden">
                CORPORATION
              </span>
              <span className="block max-w-full whitespace-nowrap text-[0.98rem] font-black uppercase tracking-[0.01em] min-[390px]:text-[1.1rem] min-[414px]:text-[1.18rem] sm:hidden">
                (OPC) PRIVATE LIMITED
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
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] 2xl:hidden">
            <div className="space-y-2">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block bg-[linear-gradient(135deg,#145b93_0%,#2f80c6_100%)] px-4 py-3 text-center text-[0.82rem] font-black uppercase tracking-[0.06em] text-white shadow-[0_10px_24px_rgba(20,91,147,0.18)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <a
                href={getEmailComposeHref(emailAddress)}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center gap-3 border border-slate-200 bg-slate-50 px-3 text-[0.9rem] font-black text-slate-900"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600">
                  <MailIcon />
                </span>
                <span className="break-all">{emailAddress}</span>
              </a>
              <NewsletterSignup variant="mobile-full" />
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

            <a
              href={getEmailComposeHref(emailAddress)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-[0.96rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[1rem] sm:text-[1.06rem] md:text-[1.1rem] lg:text-[1.12rem] 2xl:justify-end"
            >
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600">
                <MailIcon />
              </span>
              <span className="whitespace-nowrap">{emailAddress}</span>
            </a>
          </div>

        </div>

        <div className="border-t border-slate-200 px-1 pb-0.5 pt-0.5 min-[414px]:px-2 min-[414px]:pb-1 min-[414px]:pt-1 2xl:hidden">
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
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_30px] items-center gap-1 min-[414px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_32px] min-[414px]:gap-2">
              <a
                href={`tel:${cleanPhoneNumber(phonePrimary)}`}
                className="min-w-0 inline-flex items-center gap-1 whitespace-nowrap text-[0.68rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[0.72rem] min-[414px]:text-[0.76rem] sm:text-[0.84rem]"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 min-[414px]:h-7 min-[414px]:w-7">
                  <PhoneIcon />
                </span>
                <span className="truncate">{phonePrimary}</span>
              </a>
              <a
                href={`tel:${cleanPhoneNumber(phoneSecondary)}`}
                className="min-w-0 inline-flex items-center gap-1 whitespace-nowrap text-[0.68rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[0.72rem] min-[414px]:text-[0.76rem] sm:text-[0.84rem]"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 min-[414px]:h-7 min-[414px]:w-7">
                  <WhatsAppIcon />
                </span>
                <span className="truncate">{phoneSecondary}</span>
              </a>
              <button
                type="button"
                onClick={() => setIsCompactSearchOpen(true)}
                className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center border border-sky-200 bg-sky-50 text-[#145b93] transition hover:border-sky-300 hover:bg-sky-100 min-[414px]:h-8 min-[414px]:w-8"
                aria-label="Open machine search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
