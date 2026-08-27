"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const NewsletterModal = dynamic(() => import("./NewsletterModal"), {
  loading: () => null,
  ssr: false,
});

type NewsletterSignupProps = {
  variant: "desktop" | "mobile-icon" | "mobile-full" | "mobile-inline";
};

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
      <path d="M6.75 9.25a5.25 5.25 0 1 1 10.5 0c0 4.85 1.75 5.9 1.75 5.9H5s1.75-1.05 1.75-5.9" />
      <path d="M9.75 18a2.25 2.25 0 0 0 4.5 0" />
    </svg>
  );
}

function NewsletterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
      <path d="M4 6.75h16v10.5H4z" />
      <path d="m5 8 7 5 7-5" />
      <path d="M18 4v5" />
      <path d="M15.5 6.5h5" />
    </svg>
  );
}

export default function NewsletterSignup({ variant }: NewsletterSignupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === "mobile-icon") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          suppressHydrationWarning
          aria-label="Subscribe to newsletter"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B82100]/20 bg-[#B82100] text-white shadow-[0_8px_18px_rgba(184,33,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(184,33,0,0.24)] focus:outline-none focus:ring-2 focus:ring-[#B82100]/25 focus:ring-offset-2 lg:hidden"
        >
          <BellIcon />
        </button>
        {isModalOpen ? <NewsletterModal onClose={() => setIsModalOpen(false)} /> : null}
      </>
    );
  }

  if (variant === "mobile-full") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          suppressHydrationWarning
          className="inline-flex h-9 w-full items-center justify-center gap-2 border border-[#B82100]/20 bg-[#B82100] px-3 text-[0.78rem] font-black uppercase tracking-[0.03em] text-white shadow-[0_8px_18px_rgba(184,33,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(184,33,0,0.24)] focus:outline-none focus:ring-2 focus:ring-[#B82100]/25 focus:ring-offset-2"
        >
          <NewsletterIcon />
          <span className="min-w-0 whitespace-nowrap">Subscribe to Newsletter</span>
        </button>
        {isModalOpen ? <NewsletterModal onClose={() => setIsModalOpen(false)} /> : null}
      </>
    );
  }

  if (variant === "mobile-inline") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          suppressHydrationWarning
          className="flex min-h-[44px] w-full items-center justify-center gap-2 border border-[#0f4f89] bg-[linear-gradient(135deg,#145b93_0%,#2f80c6_100%)] px-3 py-2 text-center text-[0.72rem] font-black uppercase tracking-[0.03em] text-white shadow-[0_8px_18px_rgba(20,91,147,0.18)] transition hover:brightness-105 min-[390px]:text-[0.78rem]"
        >
          <NewsletterIcon />
          Newsletter
        </button>
        {isModalOpen ? <NewsletterModal onClose={() => setIsModalOpen(false)} /> : null}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        suppressHydrationWarning
        className="inline-flex h-8.5 w-full max-w-[195px] items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-[#B82100]/20 bg-[#B82100] px-1 text-[0.54rem] font-black uppercase tracking-[0.01em] text-white shadow-[0_8px_18px_rgba(184,33,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(184,33,0,0.24)] focus:outline-none focus:ring-2 focus:ring-[#B82100]/25 focus:ring-offset-2 md:h-8 md:max-w-full md:text-[0.54rem] lg:h-8.5 lg:max-w-full lg:text-[0.64rem] xl:text-[0.74rem] min-[1440px]:h-9 min-[1440px]:max-w-[328px] min-[1440px]:text-[0.78rem] min-[1440px]:px-2"
      >
        <span className="shrink-0">
          <NewsletterIcon />
        </span>
        <span className="min-w-0 truncate">Subscribe to Newsletter</span>
      </button>
      {isModalOpen ? <NewsletterModal onClose={() => setIsModalOpen(false)} /> : null}
    </>
  );
}
