import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { getSiteSettings } from "@/lib/site-settings.service";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-400" aria-hidden="true">
      <path d="M12.04 3.5a8.43 8.43 0 0 0-7.24 12.75L3.88 20l3.85-.9A8.42 8.42 0 1 0 12.04 3.5Zm0 15.36a6.9 6.9 0 0 1-3.52-.96l-.25-.15-2.27.53.54-2.22-.16-.26a6.9 6.9 0 1 1 5.66 3.06Zm3.8-5.15c-.2-.1-1.2-.6-1.39-.66-.19-.07-.33-.1-.47.1-.14.2-.54.66-.66.8-.12.14-.24.15-.44.05-.2-.1-.86-.32-1.64-1.02-.61-.54-1.02-1.21-1.14-1.41-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.14-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.47-1.13-.64-1.55-.17-.4-.34-.35-.47-.36h-.4c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.14 1.46 2.23 3.54 3.12.49.21.88.34 1.18.44.5.16.95.14 1.31.08.4-.06 1.2-.49 1.37-.96.17-.47.17-.88.12-.96-.05-.08-.19-.13-.39-.23Z" />
    </svg>
  );
}

function getEmailComposeHref(emailAddress: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`;
}

export default async function Footer() {
  const settings = await getSiteSettings();
  const { contact, footer, branding } = settings;

  const contactItems = [
    {
      icons: [Phone, WhatsAppIcon],
      content: (
        <a href={`tel:${contact.phonePrimary.replace(/\s+/g, "")}`} className="block transition hover:text-white">
          {contact.phonePrimary}
        </a>
      ),
    },
    {
      icons: [Phone, WhatsAppIcon],
      content: (
        <a href={`tel:${contact.phoneSecondary.replace(/\s+/g, "")}`} className="block transition hover:text-white">
          {contact.phoneSecondary}
        </a>
      ),
    },
    {
      icon: Mail,
      content: (
        <a
          href={getEmailComposeHref(contact.emailAddress)}
          target="_blank"
          rel="noreferrer"
          className="block break-all transition hover:text-white"
        >
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
              <span>200+ Machine Types</span>
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
                const Icons = item.icons;
                return (
                  <div key={index} className="grid grid-cols-[38px_1fr] items-start gap-3">
                    {Icons ? (
                      <span className="inline-flex h-9 w-9 items-center justify-center gap-1 rounded-md text-sky-200">
                        {Icons.map((InlineIcon, iconIndex) => (
                          <InlineIcon key={iconIndex} className="h-4 w-4" />
                        ))}
                      </span>
                    ) : Icon ? (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/14 bg-white/6 text-sky-200">
                        <Icon className="h-4 w-4" />
                      </span>
                    ) : null}
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
