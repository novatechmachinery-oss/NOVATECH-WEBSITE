import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { getSiteSettings } from "@/lib/site-settings.service";

export default async function Footer() {
  const settings = await getSiteSettings();
  const { contact, footer, companyName, companyTagline } = settings;

  const contactItems = [
    {
      icon: Phone,
      content: (
        <div className="space-y-1">
          <a href={`tel:${contact.phonePrimary.replace(/\s+/g, "")}`} className="block transition hover:text-white">
            {contact.phonePrimary}
          </a>
          <a href={`tel:${contact.phoneSecondary.replace(/\s+/g, "")}`} className="block transition hover:text-white">
            {contact.phoneSecondary}
          </a>
        </div>
      ),
    },
    {
      icon: Mail,
      content: (
        <a href={`mailto:${contact.emailAddress}`} className="block break-all transition hover:text-white">
          {contact.emailAddress}
        </a>
      ),
    },
    {
      icon: MapPin,
      content: <span className="block">{contact.officeAddress}</span>,
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(135deg,#133f67_0%,#1c5d94_45%,#0d2f50_100%)] text-sky-50">
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.32) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-[1660px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/12 pb-8 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1.15fr]">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/95 shadow-lg">
                <Image src="/images/main logo.webp" alt="Novatech logo" fill className="object-cover" />
              </div>

              <div>
                <h2 className="text-[1.55rem] font-black uppercase tracking-[0.04em] text-white">
                  {companyName}
                </h2>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
                  {companyTagline}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-[0.96rem] leading-8 text-sky-50/95">{footer.aboutText}</p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.72rem] font-black uppercase tracking-[0.14em] text-sky-50/90">
              <span>Global Sourcing</span>
              <span>50+ Machine Types</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <div>
              <h3 className="border-b border-white/14 pb-3 text-[0.82rem] font-black uppercase tracking-[0.24em] text-sky-100">
                Quick Links
              </h3>
              <div className="mt-5 space-y-3 text-[0.98rem] text-sky-50/95">
                {footer.quickLinks.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-md px-2 py-1 -mx-2 text-left transition duration-200 hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="border-b border-white/14 pb-3 text-[0.82rem] font-black uppercase tracking-[0.24em] text-sky-100">
                Machinery
              </h3>
              <div className="mt-5 space-y-3 text-[0.98rem] text-sky-50/95">
                {footer.machineryLinks.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-md px-2 py-1 -mx-2 text-left transition duration-200 hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="border-b border-white/14 pb-3 text-[0.82rem] font-black uppercase tracking-[0.24em] text-sky-100">
              Contact
            </h3>
            <div className="mt-5 space-y-4 text-[0.98rem] text-sky-50/95">
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="grid grid-cols-[42px_1fr] items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/14 bg-white/6 text-sky-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="pt-1 leading-7">{item.content}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-between gap-3 pt-5 text-sm text-sky-50/80 md:flex-row">
          <p>{footer.copyrightText}</p>
          <div className="flex items-center gap-5">
            {footer.policyLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-md px-2 py-1 transition duration-200 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
