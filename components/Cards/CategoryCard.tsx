import Link from "next/link";

type CategoryCardProps = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imagePosition?: string;
  ctaLabel?: string;
};

export default function CategoryCard({
  title,
  description,
  href,
  imageSrc,
  imagePosition = "center",
  ctaLabel = "View Details",
}: CategoryCardProps) {
  void imageSrc;
  void imagePosition;
  void ctaLabel;

  return (
    <Link
      href={href}
      className="group relative block h-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-[#d4af37]/45 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:border-[#d4af37]/80 hover:shadow-[0_26px_56px_rgba(15,23,42,0.14)]"
    >
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-x-0 top-0 h-px bg-[#f6e7a8]" />

      <div className="relative flex min-h-[168px] flex-col justify-start gap-3 px-5 py-5 sm:min-h-[184px] sm:px-6 sm:py-5 lg:min-h-[196px] lg:px-7 lg:py-5">
        <span className="inline-flex w-fit rounded-full border border-[#d4af37]/35 bg-[#fff8dc] px-4 py-1.5 text-[0.72rem] font-black uppercase tracking-[0.24em] text-[#b8860b]">
          Explore
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[1.22rem] font-black uppercase leading-tight text-[#b8860b] sm:text-[1.38rem] lg:text-[1.62rem]">
            {title}
          </h3>
          <p className="mt-2.5 max-w-[26rem] text-[0.9rem] font-semibold uppercase leading-5 text-[#c49a1d] sm:text-[0.98rem] lg:text-[1.04rem] lg:leading-6">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
