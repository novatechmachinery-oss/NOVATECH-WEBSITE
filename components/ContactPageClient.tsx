"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowUpRight,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
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
import type { SiteSettings } from "@/lib/site-settings.types";

type SubmitState =
  | { kind: "idle"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type ContactPageClientProps = {
  settings: SiteSettings["contact"];
};

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
  const contactLinks = {
    mapsEmbedUrl: `https://maps.google.com/maps?q=${mapsQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`,
    mapsOpenUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    whatsappLink: `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`,
    primaryCallLink: `tel:${settings.phonePrimary.replace(/\s+/g, "")}`,
    emailLink: `mailto:${settings.emailAddress}`,
  };
  const contactCards = [
    {
      icon: Phone,
      label: "Call Us",
      title: `${settings.phonePrimary} / ${settings.phoneSecondary}`,
      detail: settings.businessHours,
      href: contactLinks.primaryCallLink,
    },
    {
      icon: Mail,
      label: "Email Us",
      title: settings.emailAddress,
      detail: "We reply within 24 hours.",
      href: contactLinks.emailLink,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      title: settings.whatsappNumber,
      detail: "Fast responses during business hours.",
      href: contactLinks.whatsappLink,
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

    return `w-full rounded-2xl border bg-white/96 py-3.5 pl-11 pr-4 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 ${
      hasError
        ? "border-rose-300 ring-2 ring-rose-100"
        : "border-slate-200 focus:border-[#e4414c] focus:ring-2 focus:ring-rose-100"
    }`;
  }

  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#eaf3fb_0%,#f8fafc_26%,#ffffff_100%)]">
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0c3f68_0%,#145b93_42%,#0b67a3_100%)] text-white">
        <div className="absolute inset-0 opacity-[0.16]">
          <div className="absolute left-[-10%] top-10 h-56 w-56 rounded-full bg-white blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-64 w-64 rounded-full bg-sky-300 blur-3xl" />
          <div className="absolute bottom-[-30%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300 blur-3xl" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative mx-auto max-w-[1460px] px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.72rem] font-black uppercase tracking-[0.22em] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              Contact Us
            </span>
            <h1 className="mt-5 text-[2.2rem] font-black tracking-tight text-white sm:text-[2.8rem] lg:text-[3.3rem]">
              Get in Touch With Novatech
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-8 text-sky-50/92 sm:text-[1.05rem]">
              Share your machinery requirement and our team will help you source the
              right used or new industrial machine with fast, practical guidance.
            </p>
          </div>

        </div>
      </section>

      <section className="relative z-10 -mt-14 pb-14 sm:-mt-18 lg:pb-20">
        <div className="mx-auto max-w-[1720px] px-3 sm:px-4 lg:px-5">
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,70%)_minmax(320px,30%)] xl:gap-10">
            <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-[0_32px_70px_rgba(15,23,42,0.12)]">
              <div className="relative h-[540px] w-full sm:h-[620px] lg:h-[760px]">
                <iframe
                  title="Novatech Machinery office map"
                  src={contactLinks.mapsEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="grid gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-3 sm:p-5">
                <a
                  href={contactLinks.mapsOpenUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-900 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                >
                  <MapPin className="h-4 w-4" />
                  View on Map
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={contactLinks.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Now
                </a>
                <a
                  href={contactLinks.primaryCallLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </div>
            </div>

           
              <div className="h-full rounded-[1rem] border border-slate-100 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-6">
                <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#fff5f5_0%,#ffffff_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_48%,#b91c1c_100%)] text-white shadow-[0_14px_30px_rgba(220,38,38,0.24)]">
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

                <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
                  {submitState.kind !== "idle" ? (
                    <div
                      className={`rounded-[1.25rem] border px-4 py-3 text-sm leading-7 ${
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
                      <label htmlFor="firstName" className="mb-2 block text-sm font-bold text-slate-800">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formValues.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your first name"
                          className={fieldClasses("firstName")}
                          aria-invalid={Boolean(errors.firstName)}
                          aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        />
                      </div>
                      {errors.firstName ? (
                        <p id="firstName-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.firstName}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="mb-2 block text-sm font-bold text-slate-800">
                        Last Name <span className="font-medium text-slate-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formValues.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your last name"
                          className={fieldClasses("lastName")}
                          aria-invalid={Boolean(errors.lastName)}
                          aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        />
                      </div>
                      {errors.lastName ? (
                        <p id="lastName-error" className="mt-2 text-xs font-semibold text-rose-600">
                          {errors.lastName}
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_48%,#b91c1c_100%)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(220,38,38,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(220,38,38,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Sending Enquiry..." : "Send Enquiry"}
                  </button>
                </form>
              </div>
            
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {contactCards.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_42px_rgba(20,91,147,0.12)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
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
