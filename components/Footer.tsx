import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { getSiteSettings } from "@/lib/site-settings.service";

export default async function Footer() {
  const settings = await getSiteSettings();
  const { contact, footer, branding } = settings;

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

      <div className="relative mx-auto max-w-[1660px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 border-b border-white/12 pb-5 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1.15fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative h-[64px] w-[82px] shrink-0 overflow-hidden sm:h-[78px] sm:w-[102px]">
                <Image src={branding.logoSrc} alt={branding.logoAlt} fill sizes="102px" className="object-contain" />
              </div>
              <div className="min-w-0 flex flex-col leading-none text-white">
                <span className="text-[0.9rem] font-black uppercase tracking-[0.02em] sm:text-[1.1rem] xl:text-[1.32rem]">
                  Novatech Machinery Corporation
                </span>
                <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white sm:text-[0.74rem] xl:text-[0.86rem]">
                  OPC Pvt. Ltd.
                </span>
              </div>
            </div>

            <p className="mt-3.5 max-w-sm text-[0.92rem] leading-6 text-sky-50/95 sm:text-[0.96rem] sm:leading-7">{footer.aboutText}</p>

            <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1 text-[0.72rem] font-black uppercase tracking-[0.14em] text-sky-50/90">
              <span>Global Sourcing</span>
              <span>50+ Machine Types</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <div>
              <h3 className="border-b border-white/14 pb-3 text-[0.82rem] font-black uppercase tracking-[0.24em] text-sky-100">
                Quick Links
              </h3>
              <div className="mt-3.5 space-y-2 text-[0.98rem] text-sky-50/95">
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
              <div className="mt-3.5 space-y-2 text-[0.98rem] text-sky-50/95">
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
            <div className="mt-3.5 space-y-2.5 text-[0.98rem] text-sky-50/95">
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="grid grid-cols-[38px_1fr] items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/14 bg-white/6 text-sky-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="pt-0.5 leading-7">{item.content}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-between gap-2 pt-3 text-center text-sm text-sky-50/80 md:flex-row md:text-left">
          <p className="max-w-full break-words">{footer.copyrightText}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end md:gap-5">
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
