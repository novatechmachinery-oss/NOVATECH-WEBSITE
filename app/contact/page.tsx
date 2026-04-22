"use client";

import { Mail, MapPin, MessageCircleMore, Phone } from "lucide-react";
import Footer from "../../components/Footer";
import MachineCard from "../../components/Cards/MachineCard";
import SiteHeader from "../../components/SiteHeader";

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
      {children}
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="space-y-8 px-4 py-4 sm:px-5 lg:px-6 xl:px-8">
        <section className="bg-gradient-to-b from-slate-100 to-white px-4 py-12 font-sans text-slate-900 md:px-10">
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-[#1f4568] to-[#2f5d87] p-8 text-center text-white shadow-xl md:p-12">
            <h1 className="mb-3 text-4xl font-black tracking-wide md:text-5xl">Get in Touch</h1>

            <p className="text-base font-semibold text-white md:text-lg">
              Novatech Machinery Corporation (OPC) Private Limited
            </p>

            <p className="mx-auto mt-3 max-w-3xl text-base font-medium leading-relaxed text-slate-100 md:text-lg">
              Looking for quality used machinery? Share requirements and the team will help find the
              right machine for business needs.
            </p>
          </div>

          <div className="mb-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl">
              <p className="mb-4 text-2xl font-extrabold text-slate-900">Call Us</p>

              <div className="flex items-start gap-3">
                <ContactIcon>
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </ContactIcon>

                <div>
                  <p className="text-lg font-semibold leading-snug text-slate-800">+91 96462 55755 / 55855</p>
                  <p className="mt-2 text-sm font-medium text-slate-600">Mon-Sat, 9 AM - 6 PM IST</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl">
              <p className="mb-4 text-2xl font-extrabold text-slate-900">Email Us</p>

              <div className="flex items-start gap-3">
                <ContactIcon>
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </ContactIcon>

                <div>
                  <p className="break-all text-lg font-semibold leading-snug text-slate-800">
                    info@novatechmachinery.com
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">Reply within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl">
              <p className="mb-4 text-2xl font-extrabold text-slate-900">WhatsApp</p>

              <div className="flex items-start gap-3">
                <ContactIcon>
                  <MessageCircleMore className="h-5 w-5" aria-hidden="true" />
                </ContactIcon>

                <div>
                  <p className="text-lg font-semibold leading-snug text-slate-800">+91 96462 55755</p>
                  <p className="mt-2 text-sm font-medium text-slate-600">Quick support available</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl">
              <p className="mb-4 text-2xl font-extrabold text-slate-900">Visit Us</p>

              <div className="flex items-start gap-3">
                <ContactIcon>
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </ContactIcon>

                <div>
                  <p className="text-base font-semibold leading-relaxed text-slate-800">
                    Sixth Floor, OS 621, Sector 70, SAS Nagar, Punjab 160071
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">By appointment only</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
              <iframe
                src="https://maps.google.com/maps?q=Jubilee%20Walk%20Sector%2070%20Mohali&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="h-[500px] w-full border-0"
                loading="lazy"
              />

              <div className="bg-slate-50 p-4 text-center">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jubilee+Walk+Sector+70+Mohali"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base font-bold text-blue-700 hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
              <h2 className="mb-6 text-3xl font-black text-slate-900">Send an Enquiry</h2>

              <form className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="First Name *"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-slate-500"
                  />

                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-slate-500"
                  />

                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-slate-500"
                  />
                </div>

                <textarea
                  rows={5}
                  required
                  placeholder="Your Message *"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--accent)] py-3 text-lg font-bold text-white transition hover:bg-[var(--accent-strong)]"
                >
                  Send Enquiry
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <MachineCard
        title="Looking for a Specific Machine?"
        description="Tell us what you need and we'll find the right machine at the best price."
      />
      <Footer />
    </div>
  );
}
