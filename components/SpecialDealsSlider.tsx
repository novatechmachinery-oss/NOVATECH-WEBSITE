"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DealCard from "./Cards/DealCard";

type Deal = {
  machineId?: string;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  images?: string[];
  imagePositions?: string[];
};

type SpecialDealsSliderProps = {
  deals: Deal[];
};

export default function SpecialDealsSlider({ deals }: SpecialDealsSliderProps) {
  const [startIndex, setStartIndex] = useState(0);

  if (deals.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
        Special deals will appear here once machines are available in the database.
      </div>
    );
  }

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
        className="absolute left-0 top-[46%] z-10 hidden h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_14px_28px_rgba(15,23,42,0.14)] transition hover:-translate-x-[55%] hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 sm:inline-flex"
        aria-label="Previous deal"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleDeals.map((deal, index) => (
          <div
            key={`${deal.title}-${index}`}
            className={`h-full ${index === 1 ? "hidden sm:block" : ""} ${index > 1 ? "hidden xl:block" : ""}`}
          >
            <DealCard
              badge={deal.badge}
              machineId={deal.machineId}
              title={deal.title}
              description={deal.description}
              imageSrc={deal.imageSrc}
              imageAlt={deal.imageAlt}
              imagePosition={deal.imagePosition}
              images={deal.images}
              imagePositions={deal.imagePositions}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={showPreviousDeal}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.1)] transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
          aria-label="Previous deal"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={showNextDeal}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white shadow-[0_14px_28px_rgba(20,91,147,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(20,91,147,0.3)]"
          aria-label="Next deal"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={showNextDeal}
        className="absolute right-0 top-[46%] z-10 hidden h-12 w-12 translate-x-1/2 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white shadow-[0_14px_28px_rgba(20,91,147,0.24)] transition hover:translate-x-[55%] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(20,91,147,0.3)] sm:inline-flex"
        aria-label="Next deal"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
