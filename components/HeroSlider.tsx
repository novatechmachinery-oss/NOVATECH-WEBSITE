"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroSliderProps = {
  slides?: Array<{
    id?: string;
    src: string;
    alt: string;
  }>;
};

const defaultSlides = [
  { src: "/images/ChatGPT%20Image%20May%2027%2C%202026%2C%2011_41_23%20AM.png", alt: "Industrial machinery line overview" },
  { src: "/images/homa-appliances-_XDK4naBbgw-unsplash.jpg", alt: "Factory metalworking production line" },
  { src: "/images/jonas-morgner-F7u5fL11Lt0-unsplash.jpg", alt: "High-performance equipment warehouse" },
  { src: "/images/ChatGPT%20Image%20May%2027%2C%202026%2C%2011_37_15%20AM.png", alt: "Premium industrial machinery sourcing" },
];

const AUTO_CHANGE_MS = 2000;

function getPrevIndex(index: number, length: number) {
  if (length <= 1) {
    return 0;
  }

  return index === 0 ? length - 1 : index - 1;
}

function getNextIndex(index: number, length: number) {
  if (length <= 1) {
    return 0;
  }

  return index === length - 1 ? 0 : index + 1;
}

export default function HeroSlider({ slides = defaultSlides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentIndex(getNextIndex(currentIndex, slides.length));
    }, AUTO_CHANGE_MS);

    return () => window.clearTimeout(timer);
  }, [currentIndex, slides]);

  return (
    <section className="relative left-1/2 -mt-4 h-[60vh] min-h-[520px] w-screen -translate-x-1/2 overflow-hidden shadow-2xl shadow-slate-950/20 md:h-[70vh] md:min-h-[560px] lg:h-[85vh] lg:min-h-[620px]">
      <div className="absolute inset-0">
        <Image
          src={slides[currentIndex].src}
          alt={slides[currentIndex].alt}
          fill
          sizes="100vw"
          priority={currentIndex === 0}
          className="hero-slide-image object-cover object-center transition-opacity duration-700 ease-in-out"
        />
      </div>

      <div className="hero-content-zone relative z-10 flex h-full w-full items-end px-4 pb-8 pt-6 md:items-center md:px-8 md:py-8 lg:px-0">
        <div className="w-full max-w-[620px] pb-2 md:max-w-[560px] lg:ml-[clamp(32px,5vw,90px)] lg:w-[40vw] lg:pb-0">
          <h1 className="hero-heading max-w-[620px] text-[clamp(1.7rem,3.15vw,3.15rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#163d6b]">
            Connecting Global Buyers
            <br />
            with Quality Industrial Machinery
          </h1>
          <p className="hero-subheading mt-[18px] max-w-[560px] text-[clamp(1rem,1.4vw,1.25rem)] leading-[1.7] text-slate-600">
            Specialists in Used CNC Machines, Metal Working Equipment, Textile, Pharmaceutical &amp; Plastic Processing Machinery
          </p>
          <div className="hero-actions mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/used-machinery"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#16548b] px-6 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_14px_30px_rgba(22,84,139,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#0f4777] hover:shadow-[0_18px_38px_rgba(22,84,139,0.28)]"
            >
              Explore Machines
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-[#16548b] bg-white/80 px-6 text-sm font-black uppercase tracking-[0.08em] text-[#16548b] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_30px_rgba(22,84,139,0.12)]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCurrentIndex(getPrevIndex(currentIndex, slides.length))}
        className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/70 bg-white/95 text-2xl font-extrabold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-[#16548b] hover:text-white sm:left-5 md:inline-flex"
        aria-label="Previous slide"
      >
        {"<"}
      </button>

      <button
        type="button"
        onClick={() => setCurrentIndex(getNextIndex(currentIndex, slides.length))}
        className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/70 bg-white/95 text-2xl font-extrabold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-[#16548b] hover:text-white sm:right-5 md:inline-flex"
        aria-label="Next slide"
      >
        {">"}
      </button>
    </section>
  );
}
