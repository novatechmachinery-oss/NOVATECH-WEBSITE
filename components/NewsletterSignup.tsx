"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const NewsletterModal = dynamic(() => import("./NewsletterModal"), {
  loading: () => null,
  ssr: false,
});

type NewsletterSignupProps = {
  variant: "desktop" | "mobile-icon";
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
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e4414c]/20 bg-[#e4414c] text-white shadow-[0_8px_18px_rgba(228,65,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#cf2632] hover:shadow-[0_12px_24px_rgba(228,65,76,0.24)] focus:outline-none focus:ring-2 focus:ring-[#e4414c]/25 focus:ring-offset-2 lg:hidden"
        >
          <BellIcon />
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
        className="ml-1 inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#e4414c]/20 bg-[#e4414c] px-4 text-[0.76rem] font-black uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(228,65,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#cf2632] hover:shadow-[0_12px_24px_rgba(228,65,76,0.24)] focus:outline-none focus:ring-2 focus:ring-[#e4414c]/25 focus:ring-offset-2"
      >
        <NewsletterIcon />
        <span>Subscribe to Newsletter</span>
      </button>
      {isModalOpen ? <NewsletterModal onClose={() => setIsModalOpen(false)} /> : null}
    </>
  );
}
