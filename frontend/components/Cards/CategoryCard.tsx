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
      className="group relative block overflow-hidden rounded-[0.9rem] border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] hover:shadow-[0_16px_34px_var(--accent-shadow)] sm:px-4 sm:py-1"
    >
      <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-white/15 blur-2xl transition duration-300 group-hover:bg-white/20" />

      <div className="relative flex min-h-[44px] flex-col justify-center gap-0 sm:min-h-[46px] lg:min-h-[48px]">
        <div className="min-w-0 flex-1">
          <h3 className="text-[0.9rem] font-black uppercase leading-tight text-white sm:text-[0.96rem] lg:text-[1rem]">
            {title}
          </h3>
          <p className="mt-0.5 text-[0.68rem] font-semibold uppercase leading-3.5 text-white sm:text-[0.72rem] sm:leading-4">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
