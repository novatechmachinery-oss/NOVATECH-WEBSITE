import type { Metadata } from "next";
import Link from "next/link";

import HeroSlider from "../components/HeroSlider";

import CategoryCard from "../components/Cards/CategoryCard";
import MachineCard from "../components/Cards/MachineCard";
import Footer from "../components/Footer";
import MachineSearchAgent from "@/components/MachineSearchAgent";
import SiteHeader from "../components/SiteHeader";
import SpecialDealsHeadingLink from "@/components/SpecialDealsHeadingLink";
import SpecialDealsSlider from "../components/SpecialDealsSlider";
import { getSpecialDeals } from "@/lib/machines";
import { HOME_HERO_SLIDES } from "@/lib/home-hero-slides";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getFaqSchema, getLocalBusinessSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";

const HOME_FAQS = [
  {
    question: "What type of machinery does Novatech Machinery sell?",
    answer:
      "Novatech Machinery deals in used and refurbished industrial machinery including CNC machines, lathes, milling machines, boring mills, grinding machines, drilling machines, metal working machinery, textile machinery, pharmaceutical machinery, and plastic processing machinery.",
  },
  {
    question: "Where is Novatech Machinery located?",
    answer:
      "Novatech Machinery is located at Sixth Floor, OS 621, Sector 70, Sahibzada Ajit Singh Nagar (Mohali), Punjab, India — 160071. We serve customers across Mohali, Chandigarh, Ludhiana, Amritsar, Delhi, Mumbai, Pune, Ahmedabad and all across India.",
  },
  {
    question: "Does Novatech Machinery sell used CNC machines in India?",
    answer:
      "Yes, Novatech Machinery is a leading dealer of used and refurbished CNC machines in India. Our inventory includes CNC lathes, CNC milling machines, CNC boring mills, CNC machining centres, and CNC grinding machines from top global brands.",
  },
  {
    question: "How can I buy a used machine from Novatech Machinery?",
    answer:
      "You can browse our complete machine inventory on the website and contact us via WhatsApp, phone call, or email enquiry. Our team will assist you with specifications, pricing, and delivery arrangements across India.",
  },
  {
    question: "Does Novatech Machinery deliver machinery across India?",
    answer:
      "Yes, Novatech Machinery delivers used and refurbished industrial machinery across all major cities and states in India including Punjab, Haryana, Delhi, Rajasthan, Maharashtra, Gujarat, and Uttar Pradesh.",
  },
  {
    question: "What brands of used machines does Novatech deal in?",
    answer:
      "Novatech Machinery deals in used machines from top global brands including SKODA, Mazak, DMG Mori, Okuma, Haas, Fanuc, Siemens, and many other reputed international manufacturers.",
  },
  {
    question: "Are Novatech’s machines in good working condition?",
    answer:
      "Yes, all machines listed by Novatech Machinery are thoroughly inspected before listing. We offer used, refurbished, and excellent working condition machines with complete specifications and images.",
  },
  {
    question: "How to contact Novatech Machinery for an enquiry?",
    answer:
      "You can contact Novatech Machinery by calling +91 96462 55755, via WhatsApp, or through the enquiry form on our Contact page. We respond to all enquiries within 24 hours.",
  },
];

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/", {
    fallbackTitle: "Used Industrial Machinery Dealer in India | Novatech Machinery",
    fallbackDescription:
      "Novatech Machinery — India's trusted dealer for used and refurbished industrial machinery in Mohali, Punjab. Browse CNC machines, lathes, boring mills, milling machines and more. Serving buyers across India.",
    fallbackKeywords: [
      "used industrial machinery india",
      "industrial machinery dealer mohali",
      "used cnc machines punjab",
      "used machinery dealer india",
      "industrial machinery supplier mohali",
      "second hand machinery india",
      "used cnc machine for sale india",
      "industrial machinery chandigarh",
      "used lathe machine india",
      "used milling machine india",
    ],
  });
}

export default async function Home() {
  const [specialDeals, settings, localBusinessSchema, faqSchema] = await Promise.all([
    getSpecialDeals(undefined),
    getSiteSettings(),
    getLocalBusinessSchema(),
    getFaqSchema(HOME_FAQS),
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <div className="space-y-0">
          <HeroSlider slides={HOME_HERO_SLIDES} />
        </div>

        <section className="mx-[-0.75rem] bg-white py-4 sm:mx-[-1.25rem] sm:py-5 lg:mx-[-1.5rem] lg:py-6 xl:mx-[-2rem]">
          <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="mb-3.5 text-center sm:mb-4 lg:mb-5">
              <Link
                href="/metal-working-machinery"
                className="inline-flex items-center justify-center rounded-[0.35rem] bg-[#16548b] px-6 py-1.5 text-[1.36rem] font-medium tracking-[0.01em] text-white shadow-[0_12px_28px_rgba(20,91,147,0.2)] transition hover:brightness-105 sm:px-7 sm:py-2 sm:text-[1.58rem] lg:px-8 lg:py-2 lg:text-[1.9rem]"
              >
                <span>Explore Our Machines</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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

        <section
          id="special-deals"
          className="mx-[-0.75rem] mb-2 mt-2 scroll-mt-32 sm:mx-[-1.25rem] sm:mb-3 sm:mt-3 lg:mx-[-1.5rem] xl:mx-[-2rem]"
        >
          <div className="border-y border-slate-200 bg-white">
            <div className="mx-auto flex max-w-[1660px] justify-center px-3 py-3 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4">
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
          <div className="mx-auto max-w-[1840px] px-2 pb-4 sm:px-3 sm:pb-5 lg:px-4 xl:px-5">
            <SpecialDealsSlider deals={specialDeals} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-[-0.75rem] bg-white py-8 sm:mx-[-1.25rem] sm:py-10 lg:mx-[-1.5rem] xl:mx-[-2rem]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-slate-200 border border-slate-200">
              {HOME_FAQS.map((faq, i) => (
                <details key={i} className="group bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-slate-800 hover:bg-slate-50">
                    <span>{faq.question}</span>
                    <span className="ml-4 shrink-0 text-[#145b93] transition-transform group-open:rotate-180">&#9660;</span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MachineCard
        title={settings.home.machineCtaTitle}
        description={settings.home.machineCtaDescription}
      />
      <MachineSearchAgent />
      <Footer />
    </div>
  );
}

