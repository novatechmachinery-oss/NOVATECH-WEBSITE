"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SpecialDealsHeadingLinkProps = {
  title: string;
};

export default function SpecialDealsHeadingLink({ title }: SpecialDealsHeadingLinkProps) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScrollActive, setIsScrollActive] = useState(false);

  useEffect(() => {
    const node = linkRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }

        setIsScrollActive(false);
        requestAnimationFrame(() => {
          setIsScrollActive(true);
          resetTimerRef.current = setTimeout(() => setIsScrollActive(false), 1300);
        });
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.15,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <Link
      ref={linkRef}
      href="/special-deals"
      className={`special-deals-heading-link relative z-10 inline-flex items-center justify-center overflow-hidden rounded-none border-2 border-[#16548b] bg-white px-5 py-1.5 text-[1.05rem] font-black tracking-[0.01em] text-[#16548b] shadow-[0_8px_20px_rgba(20,91,147,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-sky-50 sm:px-6 sm:py-2 sm:text-[1.24rem] lg:px-7 lg:text-[1.48rem] ${
        isScrollActive ? "special-deals-heading-link--scroll-active" : ""
      }`}
    >
      <span className="relative z-10">{title}</span>
    </Link>
  );
}
