"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
  Wrench,
} from "lucide-react";
import {
  contactFormFields,
  hasContactFormErrors,
  initialContactFormValues,
  normalizeContactForm,
  type ContactFormErrors,
  type ContactFormField,
  type ContactFormValues,
  validateContactForm,
} from "@/lib/contactForm";
import { countries } from "@/lib/countries";
import type { SiteSettings } from "@/lib/site-settings.types";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

type SubmitState =
  | { kind: "idle"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type ContactPageClientProps = {
  settings: SiteSettings["contact"];
};

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2.25A9.67 9.67 0 0 0 3.7 16.78l-1.08 3.98 4.08-1.07a9.66 9.66 0 0 0 5.34 1.62h.01a9.53 9.53 0 0 0 6.79-2.82 9.62 9.62 0 0 0 2.82-6.82c0-5.19-4.32-9.42-9.62-9.42Zm0 17.42h-.01a8.08 8.08 0 0 1-4.12-1.13l-.29-.17-2.42.63.65-2.35-.19-.31a8.02 8.02 0 1 1 6.38 3.33Zm4.38-6.02c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18a7.2 7.2 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function buildTouchedState() {
  return contactFormFields.reduce(
    (accumulator, field) => {
      accumulator[field] = true;
      return accumulator;
    },
    {} as Partial<Record<ContactFormField, boolean>>,
  );
}

export default function ContactPageClient({ settings }: ContactPageClientProps) {
  const mapsQuery = encodeURIComponent(settings.mapLocation);
  const emailAddress = settings.emailAddress.trim();
  const emailComposeQuery = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: emailAddress,
    su: "Machinery enquiry",
  }).toString();
  const contactLinks = {
    mapsEmbedUrl: `https://maps.google.com/maps?q=${mapsQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`,
    mapsOpenUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    whatsappLink: WHATSAPP_HREF,
    primaryCallLink: `tel:${settings.phonePrimary.replace(/\s+/g, "")}`,
    emailLink: `https://mail.google.com/mail/?${emailComposeQuery}`,
  };
  const contactCards = [
    {
      icons: [Phone, WhatsAppIcon],
      label: "Call Us/WhatsApp Us",
      title: `${settings.phonePrimary} / ${settings.phoneSecondary}`,
      detail: settings.businessHours,
      href: contactLinks.primaryCallLink,
    },
    {
      icon: Mail,
      label: "Email Us",
      title: emailAddress,
      detail: "We reply within 24 hours.",
      href: contactLinks.emailLink,
    },
    {
      icon: MapPin,
      label: "Visit Us",
      title: settings.officeAddress,
      detail: "Visits by appointment only.",
      href: contactLinks.mapsOpenUrl,
    },
  ];
  const [formValues, setFormValues] = useState<ContactFormValues>(initialContactFormValues);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<ContactFormField, boolean>>>({});
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const normalizedCountryQuery = formValues.country.trim().toLowerCase();
  const filteredCountries = normalizedCountryQuery
    ? countries.filter((country) => country.toLowerCase().includes(normalizedCountryQuery))
    : countries;

  function setFieldError(field: ContactFormField, nextValues: ContactFormValues) {
    const nextErrors = validateContactForm(normalizeContactForm(nextValues));
    setErrors((current) => ({
      ...current,
      [field]: nextErrors[field],
    }));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as ContactFormField;
    const nextValues = {
      ...formValues,
      [field]: event.target.value,
    };

    setFormValues(nextValues);

    if (submitState.kind !== "idle") {
      setSubmitState({ kind: "idle", message: "" });
    }

    if (touchedFields[field]) {
      setFieldError(field, nextValues);
    }
  }

  function handleBlur(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as ContactFormField;
    const nextValues = normalizeContactForm({
      ...formValues,
      [field]: event.target.value,
    });

    setFormValues(nextValues);
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
    setFieldError(field, nextValues);

    if (field === "country") {
      setIsCountryMenuOpen(false);
    }
  }

  function selectCountry(country: string) {
    const nextValues = normalizeContactForm({
      ...formValues,
      country,
    });

    setFormValues(nextValues);
    setTouchedFields((current) => ({
      ...current,
      country: true,
    }));
    setFieldError("country", nextValues);
    setIsCountryMenuOpen(false);

    if (submitState.kind !== "idle") {
      setSubmitState({ kind: "idle", message: "" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValues = normalizeContactForm(formValues);
    const validationErrors = validateContactForm(normalizedValues);

    setFormValues(normalizedValues);

    if (hasContactFormErrors(validationErrors)) {
      setErrors(validationErrors);
      setTouchedFields(buildTouchedState());
      setSubmitState({
        kind: "error",
        message: "Please correct the highlighted fields before sending your enquiry.",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmitState({ kind: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedValues),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string; errors?: ContactFormErrors }
        | null;

      if (!response.ok) {
        if (result?.errors) {
          setErrors(result.errors);
          setTouchedFields(buildTouchedState());
        }

        setSubmitState({
          kind: "error",
          message: result?.message ?? "We could not send your enquiry right now. Please try again.",
        });
        return;
      }

      setFormValues(initialContactFormValues);
      setIsCountryMenuOpen(false);
      setTouchedFields({});
      setErrors({});
      setSubmitState({
        kind: "success",
        message:
          result?.message ??
          "Thanks for contacting Novatech. Our team will get back to you shortly.",
      });
    } catch {
      setSubmitState({
        kind: "error",
        message: "Network issue detected. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldClasses(field: ContactFormField) {
    const hasError = Boolean(errors[field]);

    return `w-full border bg-white/96 py-3.5 pl-11 pr-4 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 ${
      hasError
        ? "border-rose-300 ring-2 ring-rose-100"
        : "border-slate-200 focus:border-[#E32636] focus:ring-2 focus:ring-rose-100"
    }`;
  }

  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#eaf3fb_0%,#f8fafc_26%,#ffffff_100%)]">
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0c3f68_0%,#145b93_42%,#0b67a3_100%)] text-white">
        <div className="absolute inset-0 opacity-[0.16]">
          <div className="absolute left-[-10%] top-10 h-56 w-56 bg-white blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-64 w-64 bg-sky-300 blur-3xl" />
          <div className="absolute bottom-[-30%] left-1/2 h-72 w-72 -translate-x-1/2 bg-cyan-300 blur-3xl" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative mx-auto max-w-[1460px] px-3 pb-14 pt-9 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-28 lg:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center border border-white/20 bg-white/10 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.2em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] sm:px-4 sm:py-1.5 sm:text-[0.72rem] sm:tracking-[0.22em]">
              Contact Us
            </span>
            <h1 className="mt-4 text-[1.95rem] font-black leading-[1.08] tracking-tight text-white sm:mt-5 sm:text-[2.8rem] lg:text-[3.3rem]">
              Get in Touch With Novatech
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-[0.92rem] leading-7 text-sky-50/92 sm:mt-4 sm:text-[1.05rem] sm:leading-8">
              Share your machinery requirement and our team will help you source the
              right used or new industrial machine with fast, practical guidance.
            </p>
          </div>

        </div>
      </section>

      <section className="relative z-10 -mt-10 pb-12 sm:-mt-18 sm:pb-14 lg:pb-20">
        <div className="mx-auto max-w-[1720px] px-3 sm:px-4 lg:px-5">
          <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,58%)_minmax(420px,42%)] xl:gap-10">
            <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_32px_70px_rgba(15,23,42,0.12)]">
              <div className="relative h-[320px] w-full sm:h-[420px] lg:h-[560px] xl:h-[760px]">
                <iframe
                  title="Novatech Machinery office map"
                  src={contactLinks.mapsEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="border-t border-slate-200 bg-white p-3 sm:p-5">
                <a
                  href={contactLinks.mapsOpenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                >
                  <MapPin className="h-4 w-4" />
                  View on Map
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

           
              <div className="h-full border border-slate-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-6">
                <div className="bg-[linear-gradient(135deg,#fff5f5_0%,#ffffff_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center bg-[#E32636] text-white shadow-[0_14px_30px_rgba(227,38,54,0.24)]">
                      <Send className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-rose-700">
                        Send an Enquiry
                      </p>
                      <h2 className="mt-2 text-[1.7rem] font-black leading-tight text-slate-950">
                        Tell us what machine you need
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Fill in the form and we will respond with the next steps, pricing
                        guidance, or matching machine options.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  id="enquiry-form"
                  className="mt-4 scroll-mt-6 space-y-4"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  {submitState.kind !== "idle" ? (
                    <div
                      className={`border px-4 py-3 text-sm leading-7 ${
                        submitState.kind === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {submitState.message}
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-slate-800">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formValues.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your full name"
                          className={fieldClasses("fullName")}
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={errors.fullName ? "fullName-error" : undefined}
                          autoComplete="name"
                        />
                      </div>
                      {errors.fullName ? (
                        <p id="fullName-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.fullName}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="country" className="mb-2 block text-sm font-bold text-slate-800">
                        Country *
                      </label>
                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-4 top-1/2 z-[1] h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={formValues.country}
                          onChange={(event) => {
                            handleChange(event);
                            setIsCountryMenuOpen(true);
                          }}
                          onFocus={() => setIsCountryMenuOpen(true)}
                          onBlur={handleBlur}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setIsCountryMenuOpen(false);
                            }
                          }}
                          placeholder="Search and select your country"
                          className={`${fieldClasses("country")} pr-12`}
                          aria-invalid={Boolean(errors.country)}
                          aria-describedby={errors.country ? "country-error" : undefined}
                          autoComplete="country-name"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCountryMenuOpen((current) => !current)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
                          aria-label="Toggle country options"
                          aria-expanded={isCountryMenuOpen}
                          aria-controls="country-options"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isCountryMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isCountryMenuOpen ? (
                          <div
                            id="country-options"
                            className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-20 overflow-hidden border border-slate-200 bg-white shadow-[0_22px_48px_rgba(15,23,42,0.12)]"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">
                              <span>Search Results</span>
                              <span>{filteredCountries.length}</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto overscroll-contain py-1">
                              {filteredCountries.length ? (
                                filteredCountries.map((country) => {
                                  const isSelected = formValues.country === country;

                                  return (
                                    <button
                                      key={country}
                                      type="button"
                                      onMouseDown={(event) => event.preventDefault()}
                                      onClick={() => selectCountry(country)}
                                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                                        isSelected
                                          ? "bg-sky-50 font-bold text-sky-800"
                                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                                      }`}
                                    >
                                      <span>{country}</span>
                                      {isSelected ? (
                                        <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-sky-700">
                                          Selected
                                        </span>
                                      ) : null}
                                    </button>
                                  );
                                })
                              ) : (
                                <p className="px-3 py-3 text-sm text-slate-500">
                                  No matching country found. Please refine your search.
                                </p>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      {errors.country ? (
                        <p id="country-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.country}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-bold text-slate-800">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formValues.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder={settings.phonePrimary}
                          className={fieldClasses("phone")}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? "phone-error" : undefined}
                        />
                      </div>
                      {errors.phone ? (
                        <p id="phone-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.phone}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-800">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder={settings.emailAddress}
                          className={fieldClasses("email")}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? "email-error" : undefined}
                        />
                      </div>
                      {errors.email ? (
                        <p id="email-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="companyName" className="mb-2 block text-sm font-bold text-slate-800">
                        Company Name (Optional)
                      </label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formValues.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your company name"
                          className={fieldClasses("companyName")}
                          aria-invalid={Boolean(errors.companyName)}
                          aria-describedby={errors.companyName ? "companyName-error" : undefined}
                          autoComplete="organization"
                        />
                      </div>
                      {errors.companyName ? (
                        <p id="companyName-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.companyName}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="companyAddress" className="mb-2 block text-sm font-bold text-slate-800">
                        Company Address (Optional)
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="companyAddress"
                          name="companyAddress"
                          type="text"
                          value={formValues.companyAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your company address"
                          className={fieldClasses("companyAddress")}
                          aria-invalid={Boolean(errors.companyAddress)}
                          aria-describedby={errors.companyAddress ? "companyAddress-error" : undefined}
                          autoComplete="street-address"
                        />
                      </div>
                      {errors.companyAddress ? (
                        <p id="companyAddress-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.companyAddress}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="machineInterest" className="mb-2 block text-sm font-bold text-slate-800">
                      Machine of Interest *
                    </label>
                    <div className="relative">
                      <Wrench className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="machineInterest"
                        name="machineInterest"
                        type="text"
                        value={formValues.machineInterest}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="CNC Lathe, Milling Machine, Gear Hobber..."
                        className={fieldClasses("machineInterest")}
                        aria-invalid={Boolean(errors.machineInterest)}
                        aria-describedby={errors.machineInterest ? "machineInterest-error" : undefined}
                      />
                    </div>
                    {errors.machineInterest ? (
                      <p id="machineInterest-error" className="mt-2 text-xs font-semibold text-rose-600">
                        {errors.machineInterest}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-bold text-slate-800">
                      Your Message *
                    </label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-4 top-4 h-4.5 w-4.5 text-slate-400" />
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formValues.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Tell us about your requirement, preferred machine type, quantity, or delivery timeline..."
                        className={`${fieldClasses("message")} resize-y pt-4`}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "message-error" : undefined}
                      />
                    </div>
                    {errors.message ? (
                      <p id="message-error" className="mt-2 text-xs font-semibold text-rose-600">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#E32636] px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(227,38,54,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(227,38,54,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Sending Enquiry..." : "Send Enquiry"}
                  </button>
                </form>
              </div>
            
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {contactCards.map((item) => {
              const Icon = item.icon;
              const Icons = item.icons;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={`${item.label}: ${item.title}`}
                  title={item.title}
                  className="group border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_42px_rgba(20,91,147,0.12)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex min-h-14 w-12 shrink-0 flex-col items-center justify-center gap-1 bg-sky-50 text-sky-700">
                      {Icons ? (
                        Icons.map((InlineIcon, iconIndex) => (
                          <InlineIcon
                            key={iconIndex}
                            className={`h-5 w-5 ${iconIndex === 1 ? "text-emerald-600" : ""}`}
                          />
                        ))
                      ) : Icon ? (
                        <Icon className="h-5 w-5" />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.72rem] font-black uppercase tracking-[0.22em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-[1rem] font-bold leading-6 text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
