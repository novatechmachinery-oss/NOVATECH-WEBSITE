import type { Metadata } from "next";

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
        <h1 className="sr-only">Used Industrial Machinery Marketplace in India</h1>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <div className="space-y-0">
          <HeroSlider slides={HOME_HERO_SLIDES} />
        </div>

        <section className="mx-[-0.75rem] -mt-6 bg-white sm:mx-[-1.25rem] sm:-mt-8 lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="bg-white">
            <div className="mx-auto max-w-[1560px] px-4 py-3 text-center sm:px-6 sm:py-3.5 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <p className="text-[1.12rem] font-medium tracking-[0.01em] text-[#16548b] sm:text-[1.3rem] lg:text-[1.52rem]">
                  <span className="inline-block max-w-full font-serif">
                    Importers, Exporters &amp; Traders - Worldwide Suppliers of Used
                    Metal Working &amp; CNC Machinery
                  </span>
                </p>
                <p className="mt-1.5 text-[1.12rem] font-medium tracking-[0.01em] text-[#16548b] sm:text-[1.3rem] lg:text-[1.52rem]">
                  <span className="inline-block max-w-full font-serif">
                    Industrial Machinery | Textile Machinery | Pharmaceutical Machinery |
                    Plastic Machinery
                  </span>
                </p>
                <p className="mt-1 text-[1.12rem] font-medium tracking-[0.01em] text-[#16548b] sm:text-[1.3rem] lg:text-[1.52rem]">
                  <span className="inline-block max-w-full font-serif">
                    Including Complete Plants, Carbide Scrap &amp; Other Semi-Precious
                    Metals
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  <span className="special-deals-confetti pulse-soft" style={{ top: "-18px", left: "-34px", background: "#ef4444", transform: "rotate(18deg)" }} />
                  <span className="special-deals-confetti float-slow" style={{ top: "10px", left: "-54px", background: "#eab308", transform: "rotate(-22deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "46px", left: "-42px", background: "#22c55e", transform: "rotate(30deg)" }} />
                  <span className="special-deals-confetti float-slower" style={{ top: "78px", left: "-26px", background: "#3b82f6", transform: "rotate(12deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "-24px", left: "18%", background: "#ec4899", transform: "rotate(-14deg)" }} />
                  <span className="special-deals-confetti float-slow" style={{ top: "-28px", left: "38%", background: "#14b8a6", transform: "rotate(25deg)" }} />
                  <span className="special-deals-confetti float-slower" style={{ top: "-22px", left: "58%", background: "#8b5cf6", transform: "rotate(-10deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "-20px", left: "78%", background: "#f97316", transform: "rotate(18deg)" }} />
                  <span className="special-deals-confetti float-slow" style={{ top: "-14px", right: "-34px", background: "#06b6d4", transform: "rotate(-18deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "14px", right: "-56px", background: "#f43f5e", transform: "rotate(28deg)" }} />
                  <span className="special-deals-confetti float-slower" style={{ top: "50px", right: "-44px", background: "#84cc16", transform: "rotate(-24deg)" }} />
                  <span className="special-deals-confetti float-slow" style={{ top: "80px", right: "-24px", background: "#0ea5e9", transform: "rotate(16deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "78px", left: "10%", background: "#ef4444", transform: "rotate(-18deg)" }} />
                  <span className="special-deals-confetti float-slower" style={{ top: "88px", left: "28%", background: "#eab308", transform: "rotate(22deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "86px", left: "48%", background: "#22c55e", transform: "rotate(-12deg)" }} />
                  <span className="special-deals-confetti float-slow" style={{ top: "82px", left: "70%", background: "#a855f7", transform: "rotate(19deg)" }} />
                  <span className="special-deals-confetti pulse-soft" style={{ top: "76px", right: "8%", background: "#fb7185", transform: "rotate(-20deg)" }} />
                  <h2 className="relative z-10 inline-flex items-center justify-center rounded-[1rem] border-2 border-[#16548b] bg-white px-6 py-2.5 text-[1.36rem] font-medium tracking-[0.01em] text-[#16548b] shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:text-[1.58rem] lg:text-[1.9rem]">
                    <span className="font-serif">{settings.home.sectionTitle}</span>
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
