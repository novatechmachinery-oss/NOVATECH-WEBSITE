import Link from "next/link";

type CategoryCardProps = {
  title: string;
  description: string;
  href: string;
};

export default function CategoryCard({ title, description, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-[1.35rem] border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 shadow-[0_16px_38px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] hover:shadow-[0_22px_52px_var(--accent-shadow)] sm:px-4 sm:py-3"
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/15 blur-2xl transition duration-300 group-hover:bg-white/20" />

      <div className="relative flex min-h-[108px] flex-col justify-center gap-1 sm:min-h-[112px] lg:min-h-[124px]">
        <div className="min-w-0 flex-1">
          <h3 className="text-[0.92rem] font-black uppercase leading-tight text-white sm:text-[1rem]">
            {title}
          </h3>
          <p className="mt-2 text-[0.72rem] font-semibold uppercase leading-4 text-white sm:text-[0.8rem] sm:leading-5">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
