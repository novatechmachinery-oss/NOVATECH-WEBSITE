import Image from "next/image";

type DealCardProps = {
  title: string;
  description: string;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
};

export default function DealCard({
  title,
  description,
  badge,
  imageSrc,
  imageAlt,
  imagePosition = "center",
}: DealCardProps) {
  return (
    <article className="flex h-full min-h-[390px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.16)]">
      <div className="relative h-[190px] sm:h-[210px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center space-y-2 px-4 py-4 text-center sm:px-5">
        <p className="text-[0.7rem] font-extrabold uppercase text-[var(--accent)]">{badge}</p>
        <h3 className="min-h-12 text-[0.95rem] font-semibold text-slate-950 sm:text-[1rem]">{title}</h3>
        <p className="text-[0.85rem] text-slate-500">{description}</p>
        <button
          type="button"
          className="mt-auto rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-extrabold uppercase text-white shadow-md shadow-[var(--accent-shadow)] transition hover:bg-[var(--accent-strong)]"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
