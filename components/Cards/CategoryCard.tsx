import Image from "next/image";
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
  void description;

  const normalizedTitle = title.trim().toLowerCase();
  let resolvedHref = href;

  if (normalizedTitle === "all machines") {
    resolvedHref = "/used-machinery";
  } else if (normalizedTitle === "conventional machines") {
    resolvedHref = "/used-machinery?mode=conventional";
  } else if (normalizedTitle === "cnc machines") {
    resolvedHref = "/used-machinery?mode=cnc";
  }

  return (
    <Link
      href={resolvedHref}
      className="group relative block h-full cursor-pointer overflow-hidden border border-[#cfdceb] bg-[#16548b] shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:border-[#7aa5cb] hover:shadow-[0_26px_56px_rgba(15,23,42,0.14)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[#e4edf5]" />

      <div className="relative flex min-h-[220px] flex-col sm:min-h-[248px] lg:min-h-[284px]">
        <div className="relative h-[156px] overflow-hidden bg-white sm:h-[178px] lg:h-[208px]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(15,23,42,0.06))]" />
        </div>

        <div className="flex min-h-[54px] items-end justify-between gap-2 bg-[#16548b] px-3 py-2.5 sm:min-h-[60px] sm:px-4 sm:py-3 lg:min-h-[68px] lg:px-6 lg:py-3.5">
          <h3 className="max-w-[60%] text-[0.9rem] font-black uppercase leading-[1.02] text-white sm:text-[1rem] lg:text-[1.2rem]">
            {title}
          </h3>

          <span className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white px-2.5 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[#16548b] shadow-[0_10px_22px_rgba(21,84,139,0.16)] transition duration-300 group-hover:bg-[#eef5fb] sm:h-9 sm:px-3 sm:text-[0.66rem] lg:h-10 lg:px-4 lg:text-[0.7rem]">
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
