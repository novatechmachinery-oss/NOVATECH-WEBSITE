import type { Metadata } from "next";

import HeroSlider from "../components/HeroSlider";

import CategoryCard from "../components/Cards/CategoryCard";
import MachineCard from "../components/Cards/MachineCard";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import SpecialDealsHeadingLink from "@/components/SpecialDealsHeadingLink";
import SpecialDealsSlider from "../components/SpecialDealsSlider";
import { getSpecialDeals } from "@/lib/machines";
import { HOME_HERO_SLIDES } from "@/lib/home-hero-slides";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/", {
    fallbackTitle: "Used Industrial Machines in India",
    fallbackDescription:
      "Browse used industrial machines, CNC machines, boring mills, lathes, and heavy machinery with trusted sourcing from Novatech Machinery.",
    fallbackKeywords: [
      "used industrial machines",
      "cnc machines india",
      "used machinery dealer",
      "industrial machinery supplier",
    ],
  });
}

export default async function Home() {
  const [specialDeals, settings, localBusinessSchema] = await Promise.all([
    getSpecialDeals(undefined),
    getSiteSettings(),
    getLocalBusinessSchema(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="space-y-1 px-3 pb-0 pt-2 sm:space-y-2 sm:px-5 lg:px-6 xl:px-8">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <div className="space-y-0">
          <HeroSlider slides={HOME_HERO_SLIDES} />
        </div>

        <section className="mx-[-0.75rem] bg-white py-2.5 sm:mx-[-1.25rem] sm:py-3 lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="mx-auto w-full px-2 sm:px-3 lg:px-4 xl:px-5">
            <div className="mb-2.5 text-center sm:mb-3">
              <h2 className="inline-flex items-center justify-center rounded-none bg-[#B82100] px-6 py-2.5 text-[1.36rem] font-medium tracking-[0.01em] text-white shadow-[0_12px_28px_rgba(184,33,0,0.18)] sm:text-[1.58rem] lg:text-[1.9rem]">
                <span>Explore Our Machines</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {settings.home.featureCards.map((feature) => (
                <div key={feature.title} className="h-full">
                  <CategoryCard
                    title={feature.title}
                    description={feature.description}
                    href={feature.href}
                    imageSrc={feature.imageSrc}
                    imagePosition={feature.imagePosition}
                    ctaLabel={feature.ctaLabel}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-[-0.75rem] mb-1 sm:mx-[-1.25rem] lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="border-y border-slate-200 bg-white">
            <div className="mx-auto flex max-w-[1460px] justify-center px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3">
              <div className="relative overflow-visible py-0 text-center">
                <div className="relative inline-flex overflow-visible">
                  <h2>
                    <SpecialDealsHeadingLink title={settings.home.sectionTitle} />
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-[-0.75rem] bg-white sm:mx-[-1.25rem] lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="mx-auto max-w-[1740px] px-3 pb-2 sm:px-4 lg:px-6 xl:px-8">
            <SpecialDealsSlider deals={specialDeals} />
          </div>
        </section>
      </main>

      <MachineCard
        title={settings.home.machineCtaTitle}
        description={settings.home.machineCtaDescription}
      />
      <Footer />
    </div>
  );
}
