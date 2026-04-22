"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "Industrial machinery line overview",
  },
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "Factory metalworking production line",
  },
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "High-performance equipment warehouse",
  },
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "Premium industrial machinery sourcing",
  },
];

const AUTO_CHANGE_MS = 5500;

function getPrevIndex(index: number) {
  return index === 0 ? slides.length - 1 : index - 1;
}

function getNextIndex(index: number) {
  return index === slides.length - 1 ? 0 : index + 1;
}

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentIndex(getNextIndex(currentIndex));
    }, AUTO_CHANGE_MS);

    return () => window.clearTimeout(timer);
  }, [currentIndex]);

  return (
    <section className="relative h-[320px] overflow-hidden rounded-lg shadow-2xl shadow-slate-950/20 sm:h-[420px]">
      <div className="absolute inset-0">
        <Image
          src={slides[currentIndex].src}
          alt={slides[currentIndex].alt}
          fill
          sizes="100vw"
          className="object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-slate-950/10" />
      </div>

      <button
        type="button"
        onClick={() => setCurrentIndex(getPrevIndex(currentIndex))}
        className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/70 bg-white/95 text-2xl font-extrabold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-[var(--accent)] hover:text-white sm:left-5 sm:h-12 sm:w-12"
        aria-label="Previous slide"
      >
        {"<"}
      </button>

      <button
        type="button"
        onClick={() => setCurrentIndex(getNextIndex(currentIndex))}
        className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/70 bg-white/95 text-2xl font-extrabold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-[var(--accent)] hover:text-white sm:right-5 sm:h-12 sm:w-12"
        aria-label="Next slide"
      >
        {">"}
      </button>

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 w-10 rounded-full transition ${
              index === currentIndex ? "bg-[var(--accent)]" : "bg-white/60 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
