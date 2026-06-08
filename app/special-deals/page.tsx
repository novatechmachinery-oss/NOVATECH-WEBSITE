import type { Metadata } from "next";

import DealCard from "@/components/Cards/DealCard";
import Footer from "@/components/Footer";
import MachineCard from "@/components/Cards/MachineCard";
import SiteHeader from "@/components/SiteHeader";
import { getMachineInventory } from "@/lib/machines";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/special-deals", {
    fallbackTitle: "Special Deals",
    fallbackDescription:
      "Browse special deal used industrial machines from Novatech Machinery with photos, specifications, and enquiry support.",
    fallbackKeywords: [
      "special deal machines",
      "used machinery deals",
      "industrial machine offers",
    ],
  });
}

function getMachineTime(value?: string) {
  return Date.parse(value ?? "") || 0;
}

export default async function SpecialDealsPage() {
  const machines = await getMachineInventory();
  const specialDeals = machines
    .filter((machine) => machine.isSpecialDeal)
    .sort(
      (left, right) =>
        getMachineTime(right.updatedAt ?? right.createdAt) -
        getMachineTime(left.updatedAt ?? left.createdAt),
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="px-3 py-6 sm:px-5 lg:px-6 xl:px-8">
        <section className="mx-auto max-w-[1680px]">
          <div className="mb-6 border border-slate-200 bg-white px-4 py-6 text-center shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:px-6 sm:py-8">
            <h1 className="text-[1.7rem] font-semibold tracking-[0.01em] text-[#16548b] sm:text-[2.1rem] lg:text-[2.45rem]">
              <span className="font-serif">Special Deals</span>
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Current special deal machines available from Novatech Machinery.
            </p>
          </div>

          {specialDeals.length > 0 ? (
            <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 2xl:grid-cols-5">
              {specialDeals.map((machine) => (
                <DealCard
                  key={machine.id}
                  badge={machine.dealBadge ?? `${machine.machineType.toUpperCase()} - ${machine.subcategory ?? machine.category}`}
                  machineId={machine.id}
                  title={machine.title}
                  description={machine.dealDescription ?? machine.description}
                  machineType={machine.machineType.toUpperCase()}
                  imageSrc={machine.imageSrc}
                  imageAlt={machine.imageAlt}
                  imagePosition={machine.imagePosition}
                  images={machine.images}
                  imagePositions={machine.imagePositions}
                  specifications={machine.specifications}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-slate-600">
              Special deal machines will appear here once they are marked in the admin panel.
            </div>
          )}
        </section>
      </main>

      <MachineCard
        title="Need a Specific Machine?"
        description="Browse the full catalogue and connect with Novatech on WhatsApp for quick help."
      />
      <Footer />
    </div>
  );
}
