import Image from "next/image";
import Link from "next/link";

import NewsletterSignup from "./NewsletterSignup";

type TopHeaderProps = {
  phonePrimary?: string;
  phoneSecondary?: string;
  logoSrc?: string;
  logoAlt?: string;
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M21 16.4v2.85a1.75 1.75 0 0 1-1.91 1.74A17.3 17.3 0 0 1 3.01 4.91 1.75 1.75 0 0 1 4.75 3H7.6a1.75 1.75 0 0 1 1.75 1.5l.3 2.42a1.75 1.75 0 0 1-.5 1.48l-1.02 1.02a14 14 0 0 0 6.25 6.25l1.02-1.02a1.75 1.75 0 0 1 1.48-.5l2.42.3A1.75 1.75 0 0 1 21 16.4Z" />
    </svg>
  );
}

export default function TopHeader({
  phonePrimary = "+91 9646255755",
  phoneSecondary = "+91 9646255855",
  logoSrc = "/images/MAIN%20LOGO.png",
  logoAlt = "Novatech logo",
}: TopHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white text-slate-800">
      <div className="grid w-full gap-2 px-1.5 py-2 text-[0.74rem] sm:px-3 md:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-2.5 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-x-5">
        <Link href="/" className="flex min-w-0 items-center gap-2 transition hover:opacity-95 lg:gap-3">
          <div className="relative h-[52px] w-[68px] flex-none overflow-hidden sm:h-[66px] sm:w-[88px] lg:h-[78px] lg:w-[104px] xl:h-[86px] xl:w-[114px]">
            <Image src={logoSrc} alt={logoAlt} fill sizes="120px" className="object-contain" />
          </div>
          <div className="min-w-0 flex flex-col leading-[1.08] text-[#163d6b]">
            <span className="whitespace-nowrap text-[0.76rem] font-black uppercase tracking-[0.01em] min-[390px]:text-[0.9rem] sm:text-[1.28rem] md:text-[1.52rem] lg:text-[1.75rem] xl:text-[1.8rem] 2xl:text-[2rem]">
              Novatech Machinery Corporation
            </span>
            <span className="mt-0.5 whitespace-nowrap text-[0.56rem] font-black uppercase tracking-[0.12em] min-[390px]:text-[0.64rem] sm:text-[0.8rem] md:text-[0.92rem] lg:text-[0.96rem] xl:text-[1.08rem]">
              OPC Pvt. Ltd.
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm text-slate-900 lg:col-start-2 lg:row-span-2 lg:flex lg:items-center lg:justify-end lg:gap-4 xl:col-start-2 xl:row-span-1">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center leading-none sm:gap-x-3 lg:flex-nowrap lg:justify-end lg:text-right">
            <span className="inline-flex min-h-9 items-center gap-1.5">
            <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 lg:h-8 lg:w-8">
                <PhoneIcon />
            </span>
              <span className="inline-flex flex-nowrap items-center gap-1">
                <a href={`tel:${phonePrimary.replace(/\s+/g, "")}`} className="whitespace-nowrap text-[0.78rem] font-bold tracking-[0.01em] text-slate-950 transition hover:text-sky-700 sm:text-[0.9rem] md:text-[1rem]">
                  {phonePrimary}
                </a>
                <span className="text-[0.95rem] font-semibold text-slate-400">|</span>
                <a href={`tel:${phoneSecondary.replace(/\s+/g, "")}`} className="whitespace-nowrap text-[0.78rem] font-bold tracking-[0.01em] text-slate-950 transition hover:text-sky-700 sm:text-[0.9rem] md:text-[1rem]">
                  {phoneSecondary}
                </a>
              </span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <NewsletterSignup variant="mobile-icon" />
          </div>

          <div className="hidden shrink-0 lg:flex">
            <NewsletterSignup variant="desktop" />
          </div>
        </div>
      </div>
    </div>
  );
}
