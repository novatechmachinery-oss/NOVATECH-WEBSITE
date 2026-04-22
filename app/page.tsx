import Link from "next/link";
import HeroSlider from "../components/HeroSlider";

import CategoryCard from "../components/Cards/CategoryCard";
import MachineCard from "../components/Cards/MachineCard";
import Footer from "../components/Footer";
import IntroSection from "../components/IntroSection";
import SiteHeader from "../components/SiteHeader";
import SpecialDealsSlider from "../components/SpecialDealsSlider";

const introParagraphs = [
  "Novatech Machinery is a leading organization engaged in the trading and export of high-quality used and new metal working and industrial machinery. With a strong global network, we offer a wide range of machines including CNC machines, Horizontal Boring Machines (HBM), Vertical Turret Lathes (VTL), forging and stamping presses, grinding machines, plano millers, CNC portal millers, gear hobbing machines, and more.",
  "We cater to diverse industrial requirements by providing both conventional and advanced CNC solutions. In addition, we also deal in textile, pharmaceutical, plastic machinery, and complete plant setups. Our machines are sourced from reliable European and American markets, ensuring superior quality, durability, and performance. Whether you need a single machine or a complete industrial plant, Novatech Machinery delivers dependable solutions backed by technical expertise and strict quality standards.",
];

const features = [
  {
    title: "Conventional Machines",
    description: "Lathes, Milling, Grinding, Boring & More",
    href: "/metal-working-machinery#conventional-machines",
  },
  {
    title: "CNC Machines",
    description: "CNC Lathes, Machining Centres & More",
    href: "/metal-working-machinery#cnc-machines",
  },
  {
    title: "Other Machines",
    description: "Browse Every Machine In One Filter Page",
    href: "/metal-working-machinery",
  },
  {
    title: "Sell Your Machinery",
    description: "We Buy Single Machines & Complete Plants",
    href: "/contact",
  },
];

const specialDeals = [
  {
    badge: "Conventional - Plano Millers",
    title: "Plano Miller Machine",
    description: "Mario Carnaghi",
    imageSrc: "/images/hero-banner-Bt56BS_O.webp",
    imageAlt: "Plano miller machinery",
    imagePosition: "left center",
  },
  {
    badge: "Conventional - Gear Grinders",
    title: "Gear Grinding Machine REISHAUER NZA",
    description: "Precision regrinding setup",
    imageSrc: "/images/hero-banner-Bt56BS_O.webp",
    imageAlt: "Gear grinding machinery",
    imagePosition: "center center",
  },
  {
    badge: "CNC - Turning And Milling Centres",
    title: "CNC Crankshaft Turning Lathe NILES N20 LT",
    description: "Heavy-duty CNC production line",
    imageSrc: "/images/hero-banner-Bt56BS_O.webp",
    imageAlt: "CNC turning and milling centre",
    imagePosition: "right center",
  },
  {
    badge: "Hydraulic - Presses",
    title: "Hydraulic Press Machine",
    description: "Reliable pressing and forming equipment",
    imageSrc: "/images/hero-banner-Bt56BS_O.webp",
    imageAlt: "Hydraulic press machinery",
    imagePosition: "left center",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="space-y-6 px-3 py-4 sm:space-y-8 sm:px-5 lg:px-6 xl:px-8">
        <HeroSlider />
        <section className="mx-auto max-w-[1460px]">
          <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="md:flex-1">
                <CategoryCard title={feature.title} description={feature.description} href={feature.href} />
              </div>
            ))}
          </div>
        </section>
        <IntroSection paragraphs={introParagraphs} />

        <section className="mx-auto max-w-[1740px]">
          <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span className="hidden h-px bg-slate-300 sm:block" />
            <div className="text-center">
              <h2 className="text-[1.45rem] font-extrabold uppercase tracking-[0.1em] text-slate-800 sm:text-[1.65rem]">
                Special Deals
              </h2>
              <span className="accent-bg mx-auto mt-1 block h-[3px] w-10" />
            </div>
            <div className="flex justify-center sm:justify-end">
              <Link
                href="/used-machinery"
                className="rounded-md bg-slate-900 px-5 py-2.5 text-xs font-extrabold uppercase text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--accent)]"
              >
                View All
              </Link>
            </div>
          </div>

          <SpecialDealsSlider deals={specialDeals} />
        </section>

      </main>

      <MachineCard
        title="Looking for a Specific Machine?"
        description="Tell us what you need and we'll find the right machine at the best price."
      />
      <Footer />
    </div>
  );
}
