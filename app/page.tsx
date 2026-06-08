import type { Metadata } from "next";
import Link from "next/link";

import HeroSlider from "../components/HeroSlider";

import CategoryCard from "../components/Cards/CategoryCard";
import MachineCard from "../components/Cards/MachineCard";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import SpecialDealsSlider from "../components/SpecialDealsSlider";
import { getSpecialDeals } from "@/lib/machines";
import { HOME_HERO_SLIDES } from "@/lib/home-hero-slides";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

export const revalidate = 300;

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

      <main className="space-y-6 px-3 py-4 sm:space-y-8 sm:px-5 lg:px-6 xl:px-8">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <div className="space-y-0">
          <HeroSlider slides={HOME_HERO_SLIDES} />
        </div>

        <section className="mx-[-0.75rem] bg-white py-4 sm:mx-[-1.25rem] sm:py-5 lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="mx-auto max-w-[1680px] px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="mb-4 text-center sm:mb-5">
              <h2 className="inline-flex items-center justify-center rounded-[1rem] bg-[#16548b] px-6 py-2.5 text-[1.36rem] font-medium tracking-[0.01em] text-white shadow-[0_12px_28px_rgba(21,84,139,0.16)] sm:text-[1.58rem] lg:text-[1.9rem]">
                <span className="font-serif">Explore Our Machines</span>
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

        <section className="mx-[-0.75rem] mb-5 sm:mx-[-1.25rem] lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="border-y border-slate-200 bg-white">
            <div className="mx-auto flex max-w-[1460px] justify-center px-3 py-8 sm:px-4 sm:py-9 lg:px-6">
              <div className="relative overflow-visible py-3 text-center">
                <div className="relative inline-flex overflow-visible">
                  <h2>
                    <Link
                      href="/special-deals"
                      className="special-deals-heading-link relative z-10 inline-flex items-center justify-center overflow-hidden rounded-[1rem] border-2 border-[#16548b] bg-white px-7 py-2.5 text-[1.36rem] font-black tracking-[0.01em] text-[#16548b] shadow-[0_12px_28px_rgba(20,91,147,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-[0_18px_36px_rgba(20,91,147,0.18)] sm:px-8 sm:text-[1.58rem] lg:text-[1.9rem]"
                    >
                      <span className="relative z-10 font-serif">{settings.home.sectionTitle}</span>
                    </Link>
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
        whatsappHref={WHATSAPP_HREF}
      />
      <Footer />
    </div>
  );
}
