import Link from "next/link";

type MachineCardProps = {
  title: string;
  description: string;
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

export default function MachineCard({ title, description }: MachineCardProps) {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-white px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-500">
          {highlights.map((item, index) => {
            const Icon = highlightIcons[index];
            return (
              <span key={item} className="inline-flex items-center gap-2">
                <Icon />
                {item}
              </span>
            );
          })}
        </div>

        <h2 className="mt-5 text-[1.8rem] font-extrabold leading-snug text-slate-950 sm:text-[2.15rem]">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/contact"
            className="inline-flex min-w-44 items-center justify-center rounded-md bg-amber-500 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_12px_24px_rgba(245,158,11,0.24)] transition hover:-translate-y-0.5 hover:bg-amber-400"
          >
            Send Enquiry
          </Link>
          <a
            href="https://wa.me/919646255755"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-md bg-emerald-500 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_12px_24px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
