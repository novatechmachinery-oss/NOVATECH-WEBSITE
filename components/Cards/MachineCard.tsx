import Link from "next/link";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

type MachineCardProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  whatsappHref?: string;
  whatsappLabel?: string;
};

const highlights = ["50+ Machine Types", "Quick Response", "Quality Assured"];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M12 21s7-3.5 7-10V5l-7-3-7 3v6c0 6.5 7 10 7 10Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12.04 3.5a8.43 8.43 0 0 0-7.24 12.75L3.88 20l3.85-.9A8.42 8.42 0 1 0 12.04 3.5Zm0 15.36a6.9 6.9 0 0 1-3.52-.96l-.25-.15-2.27.53.54-2.22-.16-.26a6.9 6.9 0 1 1 5.66 3.06Zm3.8-5.15c-.2-.1-1.2-.6-1.39-.66-.19-.07-.33-.1-.47.1-.14.2-.54.66-.66.8-.12.14-.24.15-.44.05-.2-.1-.86-.32-1.64-1.02-.61-.54-1.02-1.21-1.14-1.41-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.14-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.47-1.13-.64-1.55-.17-.4-.34-.35-.47-.36h-.4c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.14 1.46 2.23 3.54 3.12.49.21.88.34 1.18.44.5.16.95.14 1.31.08.4-.06 1.2-.49 1.37-.96.17-.47.17-.88.12-.96-.05-.08-.19-.13-.39-.23Z" />
    </svg>
  );
}

const highlightIcons = [SearchIcon, ClockIcon, ShieldIcon];

export default function MachineCard({
  title,
  description,
  primaryHref = "/metal-working-machinery",
  primaryLabel = "View All Machines",
  whatsappHref = WHATSAPP_HREF,
  whatsappLabel = "WhatsApp",
}: MachineCardProps) {
  return (
    <section className="relative overflow-hidden px-3 py-5 text-slate-950 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[0.85rem] border border-sky-200/70 bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_52%,#f8fbff_100%)] px-4 py-5 shadow-[0_18px_44px_rgba(20,91,147,0.1)] sm:px-6 sm:py-6 lg:px-8">
          <div className="absolute inset-x-6 top-0 h-px bg-white/75" />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="inline-flex rounded-full border border-sky-200 bg-white/85 px-4 py-1.5 text-[0.64rem] font-black uppercase tracking-[0.22em] text-[#145b93]">
              Fast Sourcing Support
            </div>

            <h2 className="mt-3 text-[1.35rem] font-black leading-tight text-[#0f3b63] sm:text-[1.75rem] lg:text-[2rem]">
              {title}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-700 sm:text-[0.98rem] lg:mx-0">
              {description}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#145b93]/80 sm:gap-x-4 lg:justify-start">
              {highlights.map((item, index) => {
                const Icon = highlightIcons[index];
                return (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
                    <Icon />
                    {item}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:w-auto lg:flex-col lg:items-end">
            <Link
              href={primaryHref}
              className="inline-flex min-h-[46px] min-w-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f3b63_0%,#145b93_55%,#2f7fc7_100%)] px-5 py-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_16px_34px_rgba(20,91,147,0.24)] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(20,91,147,0.28)] sm:min-w-[210px]"
            >
              {primaryLabel}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[46px] min-w-0 items-center justify-center gap-2 rounded-full border border-sky-200 bg-white/85 px-5 py-3 text-center text-sm font-extrabold uppercase tracking-[0.08em] text-[#145b93] shadow-[0_16px_34px_rgba(20,91,147,0.12)] transition hover:-translate-y-1 hover:bg-white sm:min-w-[210px]"
            >
              <WhatsAppIcon />
              {whatsappLabel}
            </a>
          </div>
        </div>
      </div>
        </div>
      </div>
    </section>
  );
}
