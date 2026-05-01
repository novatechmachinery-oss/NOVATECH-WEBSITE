type TopHeaderProps = {
  emailAddress?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
};

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

export default function TopHeader({
  emailAddress = "info@novatechmachinery.com",
  phonePrimary = "+91 9646255755",
  phoneSecondary = "+91 9646255855",
}: TopHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white text-slate-800">
      <div className="mx-auto flex max-w-[1460px] flex-col gap-2 px-4 py-2 text-[0.74rem] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center justify-center gap-2 sm:justify-start">
          <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 lg:h-8 lg:w-8">
            <MailIcon />
          </span>
          <div className="flex min-w-0 items-center gap-2 text-[0.88rem]">
            <a
              href={`mailto:${emailAddress}`}
              className="min-w-0 whitespace-nowrap text-[0.84rem] font-semibold text-slate-900 transition hover:text-sky-700 sm:text-[0.9rem]"
            >
              {emailAddress}
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-900 lg:ml-3 lg:flex-none lg:justify-end">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 lg:h-8 lg:w-8">
            <PhoneIcon />
          </span>
          <div className="flex min-w-0 items-center justify-center gap-1.5 text-center sm:text-left">
            <a href={`tel:${phonePrimary.replace(/\s+/g, "")}`} className="whitespace-nowrap text-[0.84rem] font-semibold text-slate-900 transition hover:text-sky-700 sm:text-[0.9rem]">
              {phonePrimary}
            </a>
            <span className="text-slate-500">|</span>
            <a href={`tel:${phoneSecondary.replace(/\s+/g, "")}`} className="whitespace-nowrap text-[0.84rem] font-semibold text-slate-900 transition hover:text-sky-700 sm:text-[0.9rem]">
              {phoneSecondary}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
