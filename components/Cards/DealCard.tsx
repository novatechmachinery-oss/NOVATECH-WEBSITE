"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DealCardProps = {
  machineId?: string;
  title: string;
  description: string;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  images?: string[];
  imagePositions?: string[];
};

const IMAGE_ROTATE_MS = 2600;

export default function DealCard({
  machineId,
  title,
  description,
  badge,
  imageSrc,
  imageAlt,
  imagePosition = "center",
  images,
  imagePositions,
}: DealCardProps) {
  const router = useRouter();
  const imageList = useMemo(() => {
    if (images && images.length > 0) {
      return images;
    }
    return [imageSrc];
  }, [imageSrc, images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (imageList.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % imageList.length);
    }, IMAGE_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [imageList]);

  const [category, type] = badge.split(" - ");
  const activeImagePosition = imagePositions?.[activeImageIndex] ?? imagePosition;

  function openDeal() {
    if (machineId) {
      router.push(`/used-machinery?machine=${encodeURIComponent(machineId)}`);
      return;
    }

    router.push("/used-machinery");
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDeal}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDeal();
        }
      }}
      className="flex h-full min-h-[318px] cursor-pointer flex-col overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_20px_42px_rgba(15,23,42,0.16)]"
    >
      <div className="relative h-[245px] sm:h-[280px]">
        <Image
          src={imageList[activeImageIndex]}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-opacity duration-700"
          style={{ objectPosition: activeImagePosition }}
        />

        {imageList.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/35 px-2.5 py-1 backdrop-blur">
            {imageList.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-2.5 sm:px-5">
        <div className="flex w-full items-start gap-2">
          <div className="inline-flex w-[40%] min-w-0 items-center rounded-full bg-sky-50 px-3 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-sky-800">
              {category ?? badge}
            </p>
          </div>

          <div className="inline-flex w-[60%] min-w-0 items-center rounded-full bg-slate-100 px-3 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-700">
              {type ?? description}
            </p>
          </div>
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] max-w-full text-[1.02rem] font-semibold leading-6 text-slate-950 sm:text-[1.12rem]">
          {title}
        </h3>

        <span
          className="mt-2 self-end rounded-full bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] px-6 py-2.5 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_12px_24px_rgba(20,91,147,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(20,91,147,0.3)]"
        >
          View Details
        </span>
      </div>
    </article>
  );
}
