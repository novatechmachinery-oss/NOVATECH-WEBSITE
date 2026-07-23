"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const FALLBACK_IMAGE = "/images/ChatGPT Image May 29, 2026, 04_08_37 PM.png";

type DealCardProps = {
  machineId?: string;
  title: string;
  description: string;
  badge: string;
  machineType?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  images?: string[];
  imagePositions?: string[];
  specifications?: Array<{ label: string; value: string }>;
};

export default function DealCard({
  machineId,
  title,
  description,
  badge,
  machineType,
  imageSrc,
  imageAlt,
  imagePosition = "center",
  images,
  imagePositions,
  specifications,
}: DealCardProps) {
  const router = useRouter();
  const imageList = useMemo(() => {
    if (images && images.length > 0) {
      return images;
    }
    return [imageSrc];
  }, [imageSrc, images]);

  const [failedImages, setFailedImages] = useState<Record<string, true>>({});

  const [badgeType] = badge.split(" - ");
  const displayType = machineType ?? badgeType ?? description;
  const safeImageIndex = 0;
  const activeImagePosition = imagePositions?.[safeImageIndex] ?? imagePosition;
  const activeImageSrc = failedImages[imageList[safeImageIndex]]
    ? FALLBACK_IMAGE
    : imageList[safeImageIndex] ?? FALLBACK_IMAGE;
  const isRemoteImage = /^https?:\/\//i.test(activeImageSrc);
  const usableSpecifications = specifications?.filter(
    (spec) => spec.value?.trim() && spec.label.trim().toLowerCase() !== "condition",
  ) ?? [];
  const manufacturerSpec = usableSpecifications.find(
    (spec) => spec.label.trim().toLowerCase() === "manufacturer",
  );
  const modelSpec = usableSpecifications.find(
    (spec) => spec.label.trim().toLowerCase() === "model",
  );
  const detailsPreview = [
    manufacturerSpec ? `Manufacturer: ${manufacturerSpec.value}` : null,
    modelSpec ? `Model: ${modelSpec.value}` : null,
  ].filter((item): item is string => Boolean(item));

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
      className="flex h-full min-h-[268px] cursor-pointer flex-col overflow-hidden border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_24px_48px_rgba(15,23,42,0.18)] active:translate-y-0 sm:min-h-[300px]"
    >
      <div className="relative h-[176px] w-full bg-slate-100 sm:h-[224px] xl:h-[236px]">
        <Image
          src={activeImageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          loading="lazy"
          unoptimized={isRemoteImage}
          className="object-cover transition-opacity duration-700"
          style={{ objectPosition: activeImagePosition }}
          onError={() => {
            const currentImage = imageList[safeImageIndex];
            if (!currentImage || currentImage === FALLBACK_IMAGE) {
              return;
            }

            setFailedImages((current) => ({ ...current, [currentImage]: true }));
          }}
        />

        {imageList.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/35 px-2.5 py-1 backdrop-blur">
            {imageList.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === safeImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 py-2.5 sm:px-4 sm:py-3 2xl:px-4">
        <div className="flex w-full flex-wrap items-start gap-2">
          <div className="inline-flex min-w-0 max-w-full items-center rounded-full bg-slate-100 px-3 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-700">
              {displayType}
            </p>
          </div>
        </div>

        <h3
          title={title}
          className="mt-2.5 line-clamp-2 min-h-[2.45rem] text-[0.9rem] font-black leading-5 text-slate-950 sm:min-h-[2.85rem] sm:text-[1rem] sm:leading-6"
        >
          {title}
        </h3>

        <div className="mt-2 flex min-h-[2.8rem] w-full flex-col sm:mt-2.5 sm:min-h-[3.15rem]">
          <div className="w-full text-[0.78rem] font-semibold tracking-[0.04em] text-slate-500">
            <span className="line-clamp-2 block min-h-[2rem] sm:min-h-[2.35rem]">
              {detailsPreview.length > 0 ? detailsPreview.join(" | ") : "Manufacturer | Model"}
            </span>
          </div>
          <span className="mt-2 inline-flex w-auto min-w-[11rem] max-w-full self-center items-center justify-center rounded-[0.5rem] bg-[#16548b] px-5 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white shadow-[0_6px_14px_rgba(20,91,147,0.16)] sm:mt-2.5 sm:text-[0.78rem] sm:tracking-[0.08em]">
            View More Details
          </span>
        </div>
      </div>
    </article>
  );
}
