"use client";

import { isReactCompilerRequired } from "next/dist/build/swc";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type NewsletterStep = "options" | "email" | "whatsapp";

type NewsletterModalProps = {
  onClose: () => void;
};

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 6.75h16v10.5H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

export default function NewsletterModal({ onClose }: NewsletterModalProps) {
  const [newsletterStep, setNewsletterStep] = useState<NewsletterStep>("options");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriberWhatsapp, setSubscriberWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const portalTarget = typeof document === "undefined" ? null : document.body;

  function closeModal() {
    setNewsletterStep("options");
    setSubscriberEmail("");
    setSubscriberWhatsapp("");
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(false);
    onClose();
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
      window.setTimeout(() => closeModal(), 1500);
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
      window.setTimeout(() => closeModal(), 1500);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setErrorMessage("Failed to subscribe. Please try again later.");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
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
  });

  if (!portalTarget) {
    return null;
  }

  return createPortal(
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
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          {newsletterStep === "options" ? (
            <>
              <div className="pr-8">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#E32636]">
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
                  className="group flex min-h-14 w-full items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] sm:gap-4 sm:p-5"
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
                  className="group flex min-h-14 w-full items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50/80 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] sm:gap-4 sm:p-5"
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
                  <span aria-hidden="true">&lt;-</span>
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
                  <span aria-hidden="true">&lt;-</span>
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
    </div>,
    portalTarget,
  );
}
