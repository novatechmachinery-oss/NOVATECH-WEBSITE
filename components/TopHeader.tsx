"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type TopHeaderProps = {
  emailAddress?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  whatsappNumber?: string;
};

type NewsletterStep = "options" | "email" | "whatsapp";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 6.75h16v10.5H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M21 16.4v2.85a1.75 1.75 0 0 1-1.91 1.74A17.3 17.3 0 0 1 3.01 4.91 1.75 1.75 0 0 1 4.75 3H7.6a1.75 1.75 0 0 1 1.75 1.5l.3 2.42a1.75 1.75 0 0 1-.5 1.48l-1.02 1.02a14 14 0 0 0 6.25 6.25l1.02-1.02a1.75 1.75 0 0 1 1.48-.5l2.42.3A1.75 1.75 0 0 1 21 16.4Z" />
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
      <path d="M6.75 9.25a5.25 5.25 0 1 1 10.5 0c0 4.85 1.75 5.9 1.75 5.9H5s1.75-1.05 1.75-5.9" />
      <path d="M9.75 18a2.25 2.25 0 0 0 4.5 0" />
    </svg>
  );
}

export default function TopHeader({
  emailAddress = "info@novatechmachinery.com",
  phonePrimary = "+91 9646255755",
  phoneSecondary = "+91 9646255855",
}: TopHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newsletterStep, setNewsletterStep] = useState<NewsletterStep>("options");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberWhatsapp, setSubscriberWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const portalTarget = typeof document === "undefined" ? null : document.body;

  function openModal() {
    setNewsletterStep("options");
    setIsModalOpen(true);
    setSuccessMessage("");
    setErrorMessage("");
  }

  function closeModal() {
    setIsModalOpen(false);
    setNewsletterStep("options");
    setSubscriberEmail("");
    setSubscriberWhatsapp("");
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(false);
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: subscriberEmail.trim(),
          channel: "email",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to subscribe. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data.message);
      setSubscriberEmail("");
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setErrorMessage("Failed to subscribe. Please try again later.");
      setIsSubmitting(false);
    }
  }

  async function handleWhatsappSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: subscriberWhatsapp.trim(),
          channel: "whatsapp",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to subscribe. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data.message);
      setSubscriberWhatsapp("");
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setErrorMessage("Failed to subscribe. Please try again later.");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const newsletterModal = isModalOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
      onMouseDown={closeModal}
    >
      <div
        className="grid w-full max-w-5xl overflow-hidden rounded-[1.1rem] bg-white shadow-[0_34px_90px_rgba(2,6,23,0.36)] md:grid-cols-[42%_58%] md:rounded-[1.35rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className="relative hidden min-h-[430px] bg-slate-900 md:block"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.48)), url('/images/hero-banner-Bt56BS_O.webp')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.82))] p-7 text-white">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-sky-100">
              Novatech Updates
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight">
              Machine alerts, arrivals, and sourcing news.
            </h2>
          </div>
        </div>

        <div className="relative p-5 sm:p-6 lg:p-10">
          <button
            type="button"
            aria-label="Close newsletter options"
            onClick={closeModal}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          {newsletterStep === "options" ? (
            <>
              <div className="pr-8">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#e4414c]">
                  Subscribe
                </p>
                <h2 id="newsletter-modal-title" className="mt-3 text-[1.18rem] font-black leading-tight text-slate-950 sm:text-[1.55rem] lg:text-[2rem]">
                  How would you like to get updates?
                </h2>
                <p className="mt-2 text-[0.95rem] leading-7 text-slate-600 sm:text-base">
                  Choose your preferred channel for new machine arrivals, special deals, and buying updates.
                </p>
              </div>

              <div className="mt-5 space-y-3 sm:mt-7">
                <button
                  type="button"
                  onClick={() => setNewsletterStep("email")}
                  className="group flex w-full items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] sm:gap-4 sm:p-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 transition group-hover:bg-sky-700 group-hover:text-white sm:h-14 sm:w-14">
                    <MailIcon />
                  </span>
                  <span>
                    <span className="block text-[0.98rem] font-black text-slate-950 sm:text-base">Email Newsletter</span>
                    <span className="mt-1 block text-[0.92rem] leading-6 text-slate-600 sm:text-sm">
                      Get accurated machine updates straight to your inbox.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewsletterStep("whatsapp")}
                  className="group flex w-full items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] sm:gap-4 sm:p-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white sm:h-14 sm:w-14">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                      <path d="M5 19.25 6.15 16A7.3 7.3 0 1 1 9 18.35Z" />
                      <path d="M9.3 9.35c.2 2.9 2.4 5.05 5.3 5.35" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[0.98rem] font-black text-slate-950 sm:text-base">WhatsApp Broadcast</span>
                    <span className="mt-1 block text-[0.92rem] leading-6 text-slate-600 sm:text-sm">
                      Join our broadcast list and get instant stock alerts.
                    </span>
                  </span>
                </button>
              </div>
            </>
          ) : null}

          {newsletterStep === "email" ? (
            <form className="pt-8 sm:pt-10" onSubmit={handleEmailSubmit}>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                <MailIcon />
              </span>
              <h2 id="newsletter-modal-title" className="mt-6 text-[1.65rem] font-black leading-tight text-slate-950">
                Enter your email
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600">
                We&apos;ll send you the latest machine stocks &amp; deals
              </p>
              {errorMessage && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}
              <input
                type="email"
                required
                disabled={isSubmitting}
                value={subscriberEmail}
                onChange={(event) => setSubscriberEmail(event.target.value)}
                placeholder="your@email.com"
                className="mt-5 h-14 w-full rounded-lg border-2 border-sky-700/80 bg-slate-50 px-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-50"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-[112px_1fr]">
                <button
                  type="button"
                  onClick={() => setNewsletterStep("options")}
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
                >
                  <span aria-hidden="true">←</span>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-sky-700 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(3,105,161,0.2)] transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe Now"}
                </button>
              </div>
            </form>
          ) : null}

          {newsletterStep === "whatsapp" ? (
            <form className="pt-8 sm:pt-10" onSubmit={handleWhatsappSubmit}>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                  <path d="M5 19.25 6.15 16A7.3 7.3 0 1 1 9 18.35Z" />
                  <path d="M9.3 9.35c.2 2.9 2.4 5.05 5.3 5.35" />
                </svg>
              </span>
              <h2 id="newsletter-modal-title" className="mt-6 text-[1.65rem] font-black leading-tight text-slate-950">
                Enter your WhatsApp number
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Join our broadcast for instant stock alerts
              </p>
              {errorMessage && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}
              <input
                type="tel"
                required
                disabled={isSubmitting}
                value={subscriberWhatsapp}
                onChange={(event) => setSubscriberWhatsapp(event.target.value)}
                placeholder="+91 98765 43210"
                className="mt-5 h-14 w-full rounded-lg border-2 border-sky-700/80 bg-slate-50 px-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-50"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-[112px_1fr]">
                <button
                  type="button"
                  onClick={() => setNewsletterStep("options")}
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
                >
                  <span aria-hidden="true">←</span>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-500 px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Subscribing..." : "Join WhatsApp"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="border-b border-slate-200 bg-white text-slate-800">
        <div className="mx-auto flex max-w-[1460px] flex-col gap-0.5 px-2.5 py-1 text-[0.74rem] sm:px-4 md:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center xl:px-8">
          <div className="hidden min-w-0 items-center justify-start gap-2 lg:flex">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 lg:h-8 lg:w-8">
                <MailIcon />
              </span>
              <div className="flex min-w-0 items-center gap-2 text-[0.88rem]">
                <a
                  href={`mailto:${emailAddress}`}
                  className="min-w-0 truncate whitespace-nowrap text-[0.76rem] font-semibold text-slate-900 transition hover:text-sky-700 sm:text-[0.84rem] md:text-[0.9rem]"
                >
                  {emailAddress}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={openModal}
              suppressHydrationWarning
              aria-label="Subscribe to newsletter"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e4414c]/20 bg-[#e4414c] text-white shadow-[0_8px_18px_rgba(228,65,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#cf2632] hover:shadow-[0_12px_24px_rgba(228,65,76,0.24)] focus:outline-none focus:ring-2 focus:ring-[#e4414c]/25 focus:ring-offset-2 lg:hidden"
            >
              <BellIcon />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm text-slate-900 lg:grid-cols-[auto] lg:justify-center">
            <div className="flex min-w-0 items-center justify-center gap-1.5">
              <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 sm:h-5 sm:w-5 lg:h-8 lg:w-8">
                <PhoneIcon />
              </span>
              <div className="flex min-w-0 flex-nowrap items-center justify-center gap-0.5 text-center leading-none sm:gap-1 sm:text-left">
                <a href={`tel:${phonePrimary.replace(/\s+/g, "")}`} className="inline-flex items-center whitespace-nowrap text-[0.64rem] font-semibold leading-none text-slate-900 transition hover:text-sky-700 sm:text-[0.74rem] md:text-[0.9rem]">
                  {phonePrimary}
                </a>
                <span className="inline-flex items-center leading-none text-slate-500">|</span>
                <a href={`tel:${phoneSecondary.replace(/\s+/g, "")}`} className="inline-flex items-center whitespace-nowrap text-[0.64rem] font-semibold leading-none text-slate-900 transition hover:text-sky-700 sm:text-[0.74rem] md:text-[0.9rem]">
                  {phoneSecondary}
                </a>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <a
                href={`mailto:${emailAddress}`}
                aria-label="Email us"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:text-sky-700 sm:h-7 sm:w-7 lg:hidden"
              >
                <MailIcon />
              </a>
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={openModal}
                  suppressHydrationWarning
                  aria-label="Subscribe to newsletter"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e4414c]/20 bg-[#e4414c] text-white shadow-[0_8px_18px_rgba(228,65,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#cf2632] hover:shadow-[0_12px_24px_rgba(228,65,76,0.24)] focus:outline-none focus:ring-2 focus:ring-[#e4414c]/25 focus:ring-offset-2 sm:h-7 sm:w-7"
                >
                  <BellIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-end">
            <button
              type="button"
              onClick={openModal}
              suppressHydrationWarning
              className="ml-1 inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#e4414c]/20 bg-[#e4414c] px-4 text-[0.76rem] font-black uppercase tracking-[0.08em] text-white shadow-[0_8px_18px_rgba(228,65,76,0.18)] transition hover:-translate-y-0.5 hover:bg-[#cf2632] hover:shadow-[0_12px_24px_rgba(228,65,76,0.24)] focus:outline-none focus:ring-2 focus:ring-[#e4414c]/25 focus:ring-offset-2"
            >
              <NewsletterIcon />
              <span>Subscribe to Newsletter</span>
            </button>
          </div>
        </div>
      </div>
      {portalTarget ? createPortal(newsletterModal, portalTarget) : null}
    </>
  );
}
