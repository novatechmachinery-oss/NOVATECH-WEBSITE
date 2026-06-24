"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const NewsletterModal = dynamic(() => import("./NewsletterModal"), {
  loading: () => null,
  ssr: false,
});

type NewsletterSignupProps = {
  variant: "desktop" | "mobile-icon" | "mobile-full";
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
          className="inline-flex h-10 w-full items-center justify-center gap-2 border border-[#B82100]/20 bg-[#B82100] px-4 text-[0.84rem] font-black uppercase tracking-[0.03em] text-white shadow-[0_8px_18px_rgba(184,33,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(184,33,0,0.24)] focus:outline-none focus:ring-2 focus:ring-[#B82100]/25 focus:ring-offset-2"
        >
          <NewsletterIcon />
          <span className="min-w-0 whitespace-nowrap">Subscribe to Newsletter</span>
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
        className="inline-flex h-9 w-[20.5rem] max-w-full items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-[#B82100]/20 bg-[#B82100] px-2 text-[clamp(0.56rem,0.55vw,0.68rem)] font-black uppercase tracking-[0.02em] text-white shadow-[0_8px_18px_rgba(184,33,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(184,33,0,0.24)] focus:outline-none focus:ring-2 focus:ring-[#B82100]/25 focus:ring-offset-2 max-[1366px]:lg:h-8 max-[1366px]:lg:w-8 max-[1366px]:lg:px-0"
      >
        <span className="max-[1366px]:lg:hidden">
          <NewsletterIcon />
        </span>
        <span className="hidden max-[1366px]:lg:inline-flex">
          <BellIcon />
        </span>
        <span className="min-w-0 whitespace-nowrap max-[1366px]:lg:hidden">Subscribe to Newsletter</span>
      </button>
      {isModalOpen ? <NewsletterModal onClose={() => setIsModalOpen(false)} /> : null}
    </>
  );
}
