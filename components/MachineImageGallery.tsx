"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  title: string;
  imageAlt?: string;
};

export default function MachineImageGallery({ images, title, imageAlt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 border border-slate-200">
        <Image
          key={activeImage}
          src={activeImage}
          alt={imageAlt || title}
          fill
          priority
          unoptimized={/^https?:\/\//i.test(activeImage)}
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-contain transition-opacity duration-200"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative aspect-square overflow-hidden border-2 bg-slate-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                activeIndex === index
                  ? "border-[#145b93] ring-1 ring-[#145b93]"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <Image
                src={src}
                alt={`${title} view ${index + 1}`}
                fill
                loading="lazy"
                unoptimized={/^https?:\/\//i.test(src)}
                sizes="160px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
