"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "Modern factory floor with CNC machines and industrial production equipment",
    position: "center center",
  },
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "Industrial workshop with advanced CNC machinery and precision manufacturing stations",
    position: "left center",
  },
  {
    src: "/images/hero-banner-Bt56BS_O.webp",
    alt: "Heavy machinery facility showcasing large-scale production and industrial trading capabilities",
    position: "right center",
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
    <section className="relative isolate w-full overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
      <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[620px]">
        {slides.map((slide, index) => (
          <div
            key={slide.alt}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentIndex
                ? "z-10 scale-100 opacity-100"
                : "z-0 scale-[1.03] opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              quality={100}
              style={{ objectPosition: slide.position }}
            />
          </div>
        ))}

        <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.1)_40%,rgba(2,6,23,0.28)_100%)]" />
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_48%)]" />

        <div className="absolute inset-0 z-30 flex items-center justify-center px-4 py-10 sm:px-8 lg:px-14">
          <div
            key={currentIndex}
            className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center text-center"
          >
            <h1 className="max-w-5xl text-balance text-[1.85rem] font-extrabold leading-[1.16] text-white drop-shadow-[0_10px_30px_rgba(15,23,42,0.45)] sm:text-[2.7rem] lg:text-[3.35rem]">
              <span className="hero-text-glow inline-block animate-[heroTextRise_850ms_ease-out]">
                Importers, Exporters & Traders
              </span>{" "}
              <span className="hero-text-shine inline-block animate-[heroTextFade_1200ms_ease-out]">
                
                of the Used and New Metal Working, Pharmaceutical and Textile Machinery
              </span>
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentIndex(getPrevIndex(currentIndex))}
          className="absolute left-4 top-1/2 z-40 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/90 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.2)] transition duration-300 hover:scale-105 hover:bg-[var(--accent)] hover:text-white sm:left-6 sm:h-14 sm:w-14"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentIndex(getNextIndex(currentIndex))}
          className="absolute right-4 top-1/2 z-40 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/90 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.2)] transition duration-300 hover:scale-105 hover:bg-[var(--accent)] hover:text-white sm:right-6 sm:h-14 sm:w-14"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center gap-3 sm:bottom-8">
          {slides.map((slide, index) => (
            <button
              key={slide.alt}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-11 bg-[var(--accent)] shadow-[0_8px_20px_rgba(228,65,76,0.45)]"
                  : "w-6 bg-white/45 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
