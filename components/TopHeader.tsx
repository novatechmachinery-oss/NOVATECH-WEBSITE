function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 6.75h16v10.5H4z" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M21 16.4v2.85a1.75 1.75 0 0 1-1.91 1.74A17.3 17.3 0 0 1 3.01 4.91 1.75 1.75 0 0 1 4.75 3H7.6a1.75 1.75 0 0 1 1.75 1.5l.3 2.42a1.75 1.75 0 0 1-.5 1.48l-1.02 1.02a14 14 0 0 0 6.25 6.25l1.02-1.02a1.75 1.75 0 0 1 1.48-.5l2.42.3A1.75 1.75 0 0 1 21 16.4Z" />
    </svg>
  );
}

export default function TopHeader() {
  return (
    <div className="border-b border-slate-200/80 bg-[linear-gradient(90deg,#f8fbff_0%,#ffffff_46%,#f8fafc_100%)] text-slate-700">
      <div className="mx-auto flex max-w-[1460px] flex-col gap-1 px-4 py-1.5 text-[0.72rem] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-1">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:gap-5">
          <div className="flex min-w-0 items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-rose-100 bg-white text-rose-500 shadow-sm shadow-slate-900/5 lg:h-9 lg:w-9">
              <MailIcon />
            </span>
            <div className="flex min-w-0 items-center gap-2 text-[0.88rem]">
              <span className="flex-none text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:text-[0.68rem]">
                Email Us
              </span>
              <a
                href="mailto:info@novatechmachinery.com"
                className="min-w-0 whitespace-nowrap text-[0.84rem] font-semibold text-slate-950 transition hover:text-[var(--accent)] sm:text-[0.9rem]"
              >
                info@novatechmachinery.com
              </a>
            </div>
          </div>

         
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-700 lg:ml-3 lg:flex-none lg:justify-end">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-500 shadow-sm shadow-slate-900/5 lg:h-9 lg:w-9">
            <PhoneIcon />
          </span>
          <div className="flex min-w-0 items-center justify-center gap-1.5 text-center sm:text-left">
            <span className="flex-none text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:text-[0.68rem]">
              Call
            </span>
            <a href="tel:+919646255755" className="whitespace-nowrap text-[0.84rem] font-semibold text-slate-950 transition hover:text-cyan-700 sm:text-[0.9rem]">
              +91 9646255755
            </a>
            <span className="text-slate-300">|</span>
            <a href="tel:+919646255855" className="whitespace-nowrap text-[0.84rem] font-semibold text-slate-950 transition hover:text-cyan-700 sm:text-[0.9rem]">
              +91 9646255855
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
