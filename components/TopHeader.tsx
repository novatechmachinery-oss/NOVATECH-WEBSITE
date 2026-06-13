import Image from "next/image";
import Link from "next/link";

import NewsletterSignup from "./NewsletterSignup";

type TopHeaderProps = {
  phonePrimary?: string;
  phoneSecondary?: string;
  emailAddress?: string;
  logoSrc?: string;
  logoAlt?: string;
};

function cleanPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\s+/g, "");
}

function getWhatsAppHref(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}`;
}

function getEmailComposeHref(emailAddress: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`;
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
      <path d="M4 6.75h16v10.5H4z" />
      <path d="m5 8 7 5 7-5" />
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
}: TopHeaderProps) {
  return (
    // Outer top header: bottom border, cream background, default text color, and global header shadow/brand font.
    <div
      className="border-b border-slate-200 bg-[#fff7e6] text-slate-800"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      {/* Main header grid: one column on small/medium screens, switches to logo/name + contacts on 2xl screens; py controls header height. */}
      <div className="grid w-full grid-cols-1 gap-0 px-0 py-3 text-[0.74rem] sm:py-4 md:py-5 2xl:grid-cols-[65%_35%] 2xl:items-center 2xl:py-6">
        {/* Logo and company name row: flex keeps logo and text aligned, overflow-visible prevents long title clipping. */}
        <Link href="/" className="flex min-w-0 max-w-full items-center gap-0 overflow-visible transition hover:opacity-95">
          {/* Logo box: responsive height/width controls the logo size at mobile, tablet, desktop, and 2xl. */}
          <div className="relative h-[72px] w-[94px] flex-none overflow-hidden sm:h-[88px] sm:w-[116px] md:h-[104px] md:w-[136px] lg:h-[106px] lg:w-[140px] 2xl:h-[136px] 2xl:w-[178px]">
            <Image src={logoSrc} alt={logoAlt} fill sizes="120px" className="object-contain" />
          </div>
          {/* Company name block: flex-col stacks both lines; responsive text clamps keep the title fitting across devices. */}
          <div
            className="min-w-0 max-w-full flex-1 overflow-visible flex flex-col leading-[1.02] text-[#163d6b] lg:leading-[1.05] 2xl:-translate-y-5"
            style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
          >
            {/* First company title line: uppercase, heavy font, responsive text size, no wrapping on 2xl. */}
            <span className="block max-w-full whitespace-normal text-[0.98rem] font-black uppercase tracking-[0.02em] min-[390px]:text-[1.14rem] sm:text-[1.48rem] md:text-[1.9rem] lg:text-[clamp(1.35rem,2.25vw,1.9rem)] 2xl:whitespace-nowrap 2xl:text-[clamp(1.72rem,calc((65vw-170px)/18.2),2.30rem)]">
              NOVATECH MACHINERY CORPORATION
            </span>
            {/* Second company title line: same sizing behavior, slightly larger max size on 2xl for balance. */}
            <span className="mt-0 block max-w-full whitespace-normal text-[0.98rem] font-black uppercase tracking-[0.02em] min-[390px]:text-[1.14rem] sm:text-[1.48rem] md:text-[1.9rem] lg:text-[clamp(1.35rem,2.25vw,1.9rem)] 2xl:whitespace-nowrap 2xl:text-[clamp(1.72rem,calc((65vw-170px)/18.2),2.52rem)]">
              (OPC) PRIVATE LIMITED
            </span>
          </div>
        </Link>

        {/* Contact area: wraps on smaller screens, becomes a two-column contact grid on 2xl desktop. */}
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 overflow-hidden text-sm text-slate-900 2xl:grid 2xl:grid-cols-[max-content_max-content] 2xl:justify-start 2xl:gap-x-4 2xl:gap-y-0">
          {/* Mobile/tablet phone rows: visible below 2xl, wraps numbers and icons cleanly. */}
          <div className="flex w-full flex-wrap items-center justify-center gap-2 leading-none 2xl:hidden">
            {[phonePrimary, phoneSecondary].map((phoneNumber) => (
              <div key={phoneNumber} className="inline-flex shrink-0 items-center justify-center gap-0.5">
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  aria-label={`Call ${phoneNumber}`}
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  <PhoneIcon />
                </a>
                <a
                  href={getWhatsAppHref(phoneNumber)}
                  aria-label={`WhatsApp ${phoneNumber}`}
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  className="whitespace-nowrap text-[0.84rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[0.94rem] sm:text-[1.05rem] md:text-[1.14rem]"
                >
                  {phoneNumber}
                </a>
              </div>
            ))}
          </div>

          {/* 2xl desktop phone rows: hidden on smaller screens, shown as compact aligned contact lines. */}
          <div className="hidden min-w-0 leading-none 2xl:grid 2xl:gap-0 2xl:justify-items-start">
            {[phonePrimary, phoneSecondary].map((phoneNumber) => (
              <div key={phoneNumber} className="flex shrink-0 items-center justify-center gap-1 2xl:justify-start">
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  aria-label={`Call ${phoneNumber}`}
                  className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  <PhoneIcon />
                </a>
                <a
                  href={getWhatsAppHref(phoneNumber)}
                  aria-label={`WhatsApp ${phoneNumber}`}
                  className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  className="whitespace-nowrap text-[1.06rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 sm:text-[1.18rem] 2xl:text-[clamp(1rem,0.84vw,1.2rem)]"
                >
                  {phoneNumber}
                </a>
              </div>
            ))}
          </div>

          {/* Email + newsletter area: flex-wrap keeps it responsive; 2xl switches newsletter to desktop button. */}
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:gap-x-10 md:gap-x-14 2xl:grid 2xl:gap-1 2xl:justify-items-end">
            <a
              href={getEmailComposeHref(emailAddress)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 max-w-full items-center justify-center gap-1 overflow-hidden text-[1.04rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 sm:text-[1.16rem] 2xl:justify-end 2xl:text-[clamp(0.98rem,0.8vw,1.14rem)]"
            >
              <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600">
                <MailIcon />
              </span>
              <span className="min-w-0 max-w-full whitespace-nowrap">{emailAddress}</span>
            </a>

            <div className="flex shrink-0 items-center justify-center 2xl:hidden">
              <NewsletterSignup variant="mobile-icon" />
            </div>

            <div className="hidden shrink-0 2xl:flex">
              <NewsletterSignup variant="desktop" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
