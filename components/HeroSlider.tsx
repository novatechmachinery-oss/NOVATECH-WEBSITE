"use client";

import Image from "next/image";
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
    <section className="relative left-1/2 -mt-4 h-[49vh] min-h-[400px] max-h-[455px] w-screen -translate-x-1/2 overflow-hidden shadow-2xl shadow-slate-950/20 md:h-[53vh] md:min-h-[415px] md:max-h-[495px] lg:h-[55vh] lg:min-h-[435px] lg:max-h-[525px]">
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

      <div className="hero-content-zone relative z-10 flex h-full w-full items-end">
        <div className="w-full bg-[rgba(7,26,51,0.78)] px-4 py-3 text-center backdrop-blur-[1px] md:px-8 md:py-4 lg:px-10 lg:py-5">
          <h1
            className="hero-heading text-[clamp(1.1rem,2vw,2.15rem)] font-black leading-[1.05] tracking-[-0.03em] text-white"
            style={{
              textShadow:
                "0 1px 2px rgba(0,0,0,0.35), 0 0 10px rgba(255,255,255,0.18)",
            }}
          >
            Trusted Global Sourcing for Quality Industrial Machinery
          </h1>
          <p
            className="hero-subheading mx-auto mt-1 max-w-[1180px] text-[clamp(0.9rem,1.2vw,1.2rem)] font-black leading-[1.35] text-white"
            style={{
              fontFamily: '"Trebuchet MS", "Gill Sans", "Segoe UI", sans-serif',
              textShadow:
                "0 1px 2px rgba(0,0,0,0.32)",
            }}
          >
            Used CNC machines, metal working equipment, textile, pharmaceutical, and plastic processing solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
