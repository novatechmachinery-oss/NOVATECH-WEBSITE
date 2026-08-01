"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DealCard from "./Cards/DealCard";

type Deal = {
  machineId?: string;
  badge: string;
  title: string;
  description: string;

  machineType?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  images?: string[];
  imagePositions?: string[];
  specifications?: Array<{ label: string; value: string }>;
};

type SpecialDealsSliderProps = {
  deals: Deal[];
};

export default function SpecialDealsSlider({ deals }: SpecialDealsSliderProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = Math.min(5, deals.length);

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

  const visibleDeals = Array.from({ length: visibleCount }, (_, offset) => {
    return deals[(startIndex + offset) % deals.length];
  });

  return (
    <div className="relative px-0 xl:px-3">
      <button
        type="button"
        onClick={showPreviousDeal}
        className="absolute left-3 top-[46%] z-10 hidden h-12 w-12 -translate-x-[22%] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_14px_28px_rgba(15,23,42,0.14)] transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 sm:inline-flex"
        aria-label="Previous deal"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-5">
        {visibleDeals.map((deal, index) => (
          <div
            key={`${deal.title}-${index}`}
            className={`relative h-full ${index === 1 ? "hidden sm:block" : ""} ${index === 2 ? "hidden lg:block" : ""} ${index === 3 ? "hidden xl:block" : ""}`}
          >
            {index === 0 ? (
              <>
                <button
                  type="button"
                  onClick={showPreviousDeal}
                  className="absolute left-3 top-[88px] z-10 inline-flex h-10 w-10 -translate-x-[18%] -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/92 text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition hover:bg-white sm:hidden"
                  aria-label="Previous deal"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={showNextDeal}
                  className="absolute right-3 top-[88px] z-10 inline-flex h-10 w-10 translate-x-[18%] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#145b93]/92 text-white shadow-[0_14px_30px_rgba(20,91,147,0.28)] transition hover:bg-[#145b93] sm:hidden"
                  aria-label="Next deal"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
            <DealCard
              badge={deal.badge}
              machineId={deal.machineId}
              title={deal.title}
              description={deal.description}

              machineType={deal.machineType}
              imageSrc={deal.imageSrc}
              imageAlt={deal.imageAlt}
              imagePosition={deal.imagePosition}
              images={deal.images}
              imagePositions={deal.imagePositions}
              specifications={deal.specifications}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={showNextDeal}
        className="absolute right-3 top-[46%] z-10 hidden h-12 w-12 translate-x-[22%] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white shadow-[0_14px_28px_rgba(20,91,147,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(20,91,147,0.3)] sm:inline-flex"
        aria-label="Next deal"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
 