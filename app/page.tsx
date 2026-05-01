import HeroSlider from "../components/HeroSlider";

import CategoryCard from "../components/Cards/CategoryCard";
import MachineCard from "../components/Cards/MachineCard";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import SpecialDealsSlider from "../components/SpecialDealsSlider";
import { getSpecialDeals } from "@/lib/machines";
import { getSiteSettings } from "@/lib/site-settings.service";

export default async function Home() {
  const [specialDeals, settings] = await Promise.all([getSpecialDeals(), getSiteSettings()]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="space-y-6 px-3 py-4 sm:space-y-8 sm:px-5 lg:px-6 xl:px-8">
        <HeroSlider slides={settings.home.heroSlides} />
        <section className="mx-auto max-w-[1560px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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
        </section>

        <section className="mx-[-0.75rem] mb-5 sm:mx-[-1.25rem] lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="border-y border-slate-200 bg-white">
            <div className="mx-auto flex max-w-[1460px] justify-center px-3 py-8 sm:px-4 sm:py-9 lg:px-6">
              <div className="rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                <h2 className="text-2xl font-black uppercase tracking-[0.18em] text-slate-900 sm:text-3xl">
                  {settings.home.sectionTitle}
                </h2>
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
        whatsappHref={`https://wa.me/${settings.contact.whatsappNumber.replace(/\D/g, "")}`}
      />
      <Footer />
    </div>
  );
}
