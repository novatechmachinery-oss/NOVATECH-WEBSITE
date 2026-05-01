import Link from "next/link";

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
  whatsappHref = "https://wa.me/919646255755",
  whatsappLabel = "WhatsApp",
}: MachineCardProps) {
  return (
    <section className="relative overflow-hidden px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-200/60 bg-[linear-gradient(135deg,#fff1fb_0%,#ffe4f6_24%,#f7ddff_52%,#fce7f3_100%)] px-5 py-6 shadow-[0_22px_56px_rgba(168,85,247,0.16)] sm:px-8 sm:py-7 lg:px-10 lg:py-8">
          <div className="absolute -left-10 top-4 h-28 w-28 rounded-full bg-pink-300/35 blur-3xl" />
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-fuchsia-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-violet-300/25 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.55),transparent_45%,rgba(255,255,255,0.28)_100%)]" />
          <div className="absolute inset-x-6 top-0 h-px bg-white/75" />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="inline-flex rounded-full border border-fuchsia-200 bg-white/80 px-4 py-1.5 text-[0.64rem] font-black uppercase tracking-[0.22em] text-fuchsia-700">
              Fast Sourcing Support
            </div>

            <h2 className="mt-4 text-[1.65rem] font-black leading-tight text-[#4a124f] sm:text-[1.95rem] lg:text-[2.2rem]">
              {title}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-fuchsia-950/70 sm:text-[0.98rem] lg:mx-0">
              {description}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-fuchsia-900/70 sm:gap-x-4 lg:justify-start">
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

          <div className="flex flex-col items-center gap-3 sm:flex-row lg:w-auto lg:flex-col lg:items-end">
            <Link
              href={primaryHref}
              className="inline-flex min-w-[210px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#ec4899_0%,#db2777_48%,#c026d3_100%)] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_16px_34px_rgba(219,39,119,0.28)] transition hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(192,38,211,0.3)]"
            >
              {primaryLabel}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-full border border-fuchsia-200 bg-white/85 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-fuchsia-800 shadow-[0_16px_34px_rgba(236,72,153,0.14)] transition hover:-translate-y-1 hover:bg-white"
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
