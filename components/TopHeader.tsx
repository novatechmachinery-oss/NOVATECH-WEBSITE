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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M21 16.4v2.85a1.75 1.75 0 0 1-1.91 1.74A17.3 17.3 0 0 1 3.01 4.91 1.75 1.75 0 0 1 4.75 3H7.6a1.75 1.75 0 0 1 1.75 1.5l.3 2.42a1.75 1.75 0 0 1-.5 1.48l-1.02 1.02a14 14 0 0 0 6.25 6.25l1.02-1.02a1.75 1.75 0 0 1 1.48-.5l2.42.3A1.75 1.75 0 0 1 21 16.4Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
      <path d="M4 6.75h16v10.5H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
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
    <div
      className="border-b border-slate-200 bg-[#fff7e6] text-slate-800"
      style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
    >
      <div className="grid w-full grid-cols-1 gap-0 p-0 text-[0.74rem] lg:grid-cols-[65%_35%] lg:items-center">
        <Link href="/" className="flex min-w-0 max-w-full items-center gap-0 overflow-visible transition hover:opacity-95 lg:overflow-hidden">
          <div className="relative h-[62px] w-[82px] flex-none overflow-hidden sm:h-[76px] sm:w-[102px] md:h-[86px] md:w-[114px] lg:h-[102px] lg:w-[136px] max-[1366px]:lg:h-[88px] max-[1366px]:lg:w-[118px] xl:h-[112px] xl:w-[150px]">
            <Image src={logoSrc} alt={logoAlt} fill sizes="120px" className="object-contain" />
          </div>
          <div
            className="min-w-0 max-w-full flex-1 overflow-visible flex flex-col leading-[1.02] text-[#163d6b] lg:overflow-hidden lg:leading-[1.05]"
            style={{ fontFamily: '"Arial Black", Arial, Helvetica, sans-serif' }}
          >
            <span className="block max-w-full whitespace-normal text-[0.98rem] font-black uppercase tracking-[0.02em] min-[390px]:text-[1.14rem] sm:text-[1.48rem] md:text-[1.9rem] lg:whitespace-nowrap lg:text-[clamp(1.72rem,calc((65vw-170px)/18.2),2.30rem)] max-[1366px]:lg:text-[clamp(1.35rem,2.25vw,1.9rem)]">
              NOVATECH MACHINERY CORPORATION
            </span>
            <span className="mt-0 block max-w-full whitespace-normal text-[0.98rem] font-black uppercase tracking-[0.02em] min-[390px]:text-[1.14rem] sm:text-[1.48rem] md:text-[1.9rem] lg:whitespace-nowrap lg:text-[clamp(1.72rem,calc((65vw-170px)/18.2),2.52rem)] max-[1366px]:lg:text-[clamp(1.35rem,2.25vw,1.9rem)]">
              (OPC) PRIVATE LIMITED
            </span>
          </div>
        </Link>

        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 overflow-hidden text-sm text-slate-900 lg:grid lg:grid-cols-[max-content_max-content] lg:justify-start lg:gap-x-4 lg:gap-y-0 max-[1366px]:lg:grid-cols-1 max-[1366px]:lg:gap-y-1">
          <div className="flex w-full flex-nowrap items-center justify-center gap-2 leading-none lg:hidden">
            {[phonePrimary, phoneSecondary].map((phoneNumber) => (
              <div key={phoneNumber} className="inline-flex shrink-0 items-center justify-center gap-0.5">
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  aria-label={`Call ${phoneNumber}`}
                  className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  <PhoneIcon />
                </a>
                <a
                  href={getWhatsAppHref(phoneNumber)}
                  aria-label={`WhatsApp ${phoneNumber}`}
                  className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  className="whitespace-nowrap text-[0.72rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 min-[390px]:text-[0.82rem] sm:text-[0.92rem] md:text-[1rem]"
                >
                  {phoneNumber}
                </a>
              </div>
            ))}
          </div>

          <div className="hidden min-w-0 leading-none lg:grid lg:gap-0 lg:justify-items-start max-[1366px]:lg:grid-cols-2 max-[1366px]:lg:gap-x-2">
            {[phonePrimary, phoneSecondary].map((phoneNumber) => (
              <div key={phoneNumber} className="flex shrink-0 items-center justify-center gap-1 lg:justify-start max-[1366px]:lg:gap-0.5">
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  aria-label={`Call ${phoneNumber}`}
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:border-sky-300 hover:bg-sky-100 max-[1366px]:lg:h-6 max-[1366px]:lg:w-6"
                >
                  <PhoneIcon />
                </a>
                <a
                  href={getWhatsAppHref(phoneNumber)}
                  aria-label={`WhatsApp ${phoneNumber}`}
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100 max-[1366px]:lg:h-6 max-[1366px]:lg:w-6"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href={`tel:${cleanPhoneNumber(phoneNumber)}`}
                  className="whitespace-nowrap text-[0.96rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 sm:text-[1.08rem] lg:text-[clamp(0.9rem,0.72vw,1.08rem)] max-[1366px]:lg:text-[0.78rem]"
                >
                  {phoneNumber}
                </a>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 items-center justify-center gap-6 sm:gap-10 md:gap-14 lg:grid lg:gap-1 lg:justify-items-end max-[1366px]:lg:grid max-[1366px]:lg:grid-cols-[max-content_auto] max-[1366px]:lg:justify-start max-[1366px]:lg:justify-items-start max-[1366px]:lg:gap-x-16 max-[1366px]:lg:gap-y-0">
            <a
              href={getEmailComposeHref(emailAddress)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 max-w-full items-center justify-center gap-1 overflow-hidden text-[0.92rem] font-black tracking-[0.01em] text-slate-950 transition hover:text-sky-700 sm:text-[1.04rem] lg:justify-end lg:text-[clamp(0.86rem,0.68vw,1.02rem)] max-[1366px]:lg:justify-start max-[1366px]:lg:text-[clamp(0.62rem,0.82vw,0.76rem)]"
            >
              <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 max-[1366px]:lg:h-6 max-[1366px]:lg:w-6">
                <MailIcon />
              </span>
              <span className="min-w-0 max-w-full whitespace-nowrap max-[1366px]:lg:tracking-[-0.02em]">{emailAddress}</span>
            </a>

            <div className="flex shrink-0 items-center justify-center lg:hidden">
              <NewsletterSignup variant="mobile-icon" />
            </div>

            <div className="hidden shrink-0 lg:flex">
              <NewsletterSignup variant="desktop" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
