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
      className="group relative block h-full cursor-pointer overflow-hidden rounded-[0.35rem] border border-[#d7e2ee] bg-[#16548b] shadow-[0_22px_46px_rgba(20,91,147,0.24)] transition duration-300 hover:border-[#7aa5cb] hover:shadow-[0_30px_58px_rgba(20,91,147,0.3)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[#e4edf5]" />

      <div className="relative flex min-h-[153px] flex-col sm:min-h-[178px] lg:min-h-[204px]">
        <div className="relative h-[117px] overflow-hidden bg-white sm:h-[134px] lg:h-[156px]">
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

        <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-[#16548b] px-2.5 py-1.5 sm:px-3.5 sm:py-2 lg:px-5">
          <h3 className="min-w-0 text-balance text-[0.88rem] font-black uppercase leading-none text-white sm:text-[0.98rem] lg:text-[1.04rem] xl:text-[1.08rem] 2xl:text-[1.12rem]">
            {title}
          </h3>

          <span className="inline-flex h-7 min-w-[7.35rem] shrink-0 items-center justify-center rounded-[0.45rem] border border-white/90 bg-[linear-gradient(180deg,#ffffff_0%,#eef4fb_100%)] px-2.5 text-center text-[0.58rem] font-black uppercase tracking-[0.1em] text-[#16548b] shadow-[0_8px_18px_rgba(8,47,73,0.18)] transition duration-300 group-hover:bg-[#f7fbff] sm:h-8 sm:min-w-[7.6rem] sm:px-3 sm:text-[0.64rem] lg:min-w-[6.9rem] lg:text-[0.64rem] xl:min-w-[7.4rem] xl:text-[0.68rem]">
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
