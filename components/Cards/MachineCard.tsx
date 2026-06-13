import Link from "next/link";

type MachineCardProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
};

const highlights = ["200+ Machine Types", "Quick Response", ];

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

const highlightIcons = [SearchIcon, ClockIcon, ShieldIcon];

export default function MachineCard({
  title,
  description,
  primaryHref = "/metal-working-machinery",
  primaryLabel = "Click Here",
}: MachineCardProps) {
  return (
    <section className="relative overflow-hidden px-0 pb-0.5 pt-0 text-slate-950 sm:px-1 sm:pb-1 lg:px-2">
      <div className="mx-auto w-full">
        <div className="relative overflow-hidden border border-sky-200/70 bg-[linear-gradient(135deg,#f8fbff_0%,#eef7ff_52%,#f8fbff_100%)] px-3 py-3 shadow-[0_14px_34px_rgba(20,91,147,0.1)] sm:px-5 sm:py-4 lg:px-6">
          <div className="relative mx-auto w-full max-w-[1500px]">
            <div className="flex flex-col items-center justify-center gap-4 text-center sm:gap-5">
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center">
            <div className="inline-flex border border-sky-200 bg-white/85 px-4 py-1.5 text-[0.64rem] font-black uppercase tracking-[0.22em] text-[#145b93]">
              Fast Sourcing Support
            </div>

            <h2 className="mt-2.5 text-[1.35rem] font-black leading-tight text-[#0f3b63] sm:text-[1.75rem] lg:text-[2rem]">
              {title}
            </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-700 sm:text-[0.98rem]">
                  {description}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#145b93]/80 sm:gap-x-5">
                  {highlights.map((item, index) => {
                    const Icon = highlightIcons[index];
                    return (
                      <span key={item} className="inline-flex items-center gap-2 border border-white/60 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
                        <Icon />
                        {item}
                      </span>
                    );
                  })}
                  <Link
                    href={primaryHref}
                    className="inline-flex min-h-[36px] items-center justify-center bg-[#145b93] px-4 py-1.5 text-center text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_10px_22px_rgba(20,91,147,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0f4c7c]"
                  >
                    {primaryLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
