"use client";

import { useState } from "react";
import DealCard from "./Cards/DealCard";

type Deal = {
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
};

type SpecialDealsSliderProps = {
  deals: Deal[];
};

export default function SpecialDealsSlider({ deals }: SpecialDealsSliderProps) {
  const [startIndex, setStartIndex] = useState(0);

  function showPreviousDeal() {
    setStartIndex(startIndex === 0 ? deals.length - 1 : startIndex - 1);
  }

  function showNextDeal() {
    setStartIndex(startIndex === deals.length - 1 ? 0 : startIndex + 1);
  }

  const visibleDeals = [
    deals[startIndex],
    deals[(startIndex + 1) % deals.length],
    deals[(startIndex + 2) % deals.length],
    deals[(startIndex + 3) % deals.length],
  ];

  return (
    <div className="relative px-0 sm:px-0">
      <button
        type="button"
        onClick={showPreviousDeal}
        className="absolute left-0 top-[46%] z-10 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-md border border-slate-300 bg-white text-xl font-bold text-slate-800 shadow-md transition hover:border-[var(--accent-soft-border)] hover:bg-[var(--accent)] hover:text-white sm:inline-flex"
        aria-label="Previous deal"
      >
        {"<"}
      </button>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleDeals.map((deal, index) => (
          <div
            key={`${deal.title}-${index}`}
            className={`h-full ${index === 1 ? "hidden sm:block" : ""} ${index > 1 ? "hidden xl:block" : ""}`}
          >
            <DealCard
              badge={deal.badge}
              title={deal.title}
              description={deal.description}
              imageSrc={deal.imageSrc}
              imageAlt={deal.imageAlt}
              imagePosition={deal.imagePosition}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={showPreviousDeal}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-lg font-bold text-slate-800 shadow-sm transition hover:border-[var(--accent-soft-border)] hover:text-[var(--accent)]"
          aria-label="Previous deal"
        >
          {"<"}
        </button>
        <button
          type="button"
          onClick={showNextDeal}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-lg font-bold text-white shadow-md shadow-[var(--accent-shadow)] transition hover:bg-[var(--accent-strong)]"
          aria-label="Next deal"
        >
          {">"}
        </button>
      </div>

      <button
        type="button"
        onClick={showNextDeal}
        className="absolute right-0 top-[46%] z-10 hidden h-11 w-11 translate-x-1/2 items-center justify-center rounded-md bg-[var(--accent)] text-xl font-bold text-white shadow-md shadow-[var(--accent-shadow)] transition hover:bg-[var(--accent-strong)] sm:inline-flex"
        aria-label="Next deal"
      >
        {">"}
      </button>
    </div>
  );
}
