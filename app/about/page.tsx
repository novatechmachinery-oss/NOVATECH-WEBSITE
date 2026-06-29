import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Factory,
  Globe,
  MapPin,
  PackageCheck,
  Settings,
  Shield,
  Wrench,
} from "lucide-react";
import Footer from "../../components/Footer";
import SiteHeader from "../../components/SiteHeader";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const revalidate = 300;

const paragraphs = [
  "Novatech Machinery is a leading organization engaged in the trading and export of high-quality used and new metal working and industrial machinery. With a strong global network, we offer a wide range of machines including CNC machines, Horizontal Boring Machines (HBM), Vertical Turret Lathes (VTL), forging and stamping presses, grinding machines, plano millers, CNC portal millers, gear hobbing machines, and more.",
  "We cater to diverse industrial requirements by providing both conventional and advanced CNC solutions. In addition, we also deal in textile, pharmaceutical, plastic machinery, and complete plant setups. Our machines are sourced from reliable European and American markets, ensuring superior quality, durability, and performance. Whether you need a single machine or a complete industrial plant, Novatech Machinery delivers dependable solutions backed by technical expertise and strict quality standards.",
];

const stats = [
  { icon: Globe, title: "Europe & USA", label: "Global Sourcing" },
  { icon: Wrench, title: "200+", label: "Machine Types" },
  { icon: Factory, title: "Multi-Industry", label: "Turn-Key Projects" },
  { icon: BadgeCheck, title: "100%", label: "Quality Tested" },
];

const reasons = [
  {
    icon: Wrench,
    title: "Diverse Range",
    text: "Wide range of metal working and industrial machinery with both conventional and CNC controls.",
  },
  {
    icon: Globe,
    title: "Global Sourcing",
    text: "Machines sourced from European and American markets to ensure dependable quality.",
  },
  {
    icon: Shield,
    title: "Quality Tested",
    text: "Each machine is checked carefully against industrial performance standards before delivery.",
  },
  {
    icon: Award,
    title: "Superior Tech",
    text: "Technically sound machinery with practical performance for long-term industrial use.",
  },
  {
    icon: PackageCheck,
    title: "Turn-Key Projects",
    text: "Complete turn-key project support for sugar, paper, cement, and fertilizer plants.",
  },
  {
    icon: Settings,
    title: "Flexible Supply",
    text: "Single machine procurement as well as complete plant setup capability for varied needs.",
  },
];

const machineRange = [
  "Horizontal Boring Machines (HBM)",
  "Vertical Turret Lathes (VTL)",
  "Forging & Stamping Presses",
  "Grinding Machines",
  "Plano Millers & CNC Portal Millers",
  "Center Lathes",
  "CNC Turning Centers & CNC Lathes",
  "Vertical Machining Centers (VMC)",
  "Horizontal Machining Centers (HMC)",
  "Gear Hobbing, Gear Shapers & Gear Grinders",
  "Slotting, Facing & Centering Machines",
  "Deep Hole Boring Machines",
  "Bending Rolls & Injection Molding Machines",
  "Rubber, Pharmaceutical & Textile Machinery",
];

const machineRangeColumns = [
  machineRange.slice(0, 7),
  machineRange.slice(7),
];

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/about", {
    fallbackTitle: "About Novatech Machinery",
    fallbackDescription:
      "Learn about Novatech Machinery, our global sourcing network, industrial expertise, and used machinery solutions for multiple industries.",
    fallbackKeywords: [
      "about novatech machinery",
      "industrial machinery company",
      "used machinery supplier india",
    ],
  });
}

export default async function AboutPage() {
  const breadcrumbSchema = await getBreadcrumbSchema("/about");
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <SiteHeader />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#123f67_0%,#1e5f95_45%,#0f6aa4_100%)] text-white">
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative mx-auto max-w-[1740px] px-3 pb-16 pt-9 text-center sm:px-6 sm:pb-24 sm:pt-12 lg:px-8 lg:pb-32 lg:pt-18">
            <span className="inline-flex items-center border border-white/16 bg-white/10 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.2em] text-sky-50 sm:px-4 sm:py-1.5 sm:text-[0.72rem] sm:tracking-[0.24em]">
              About Us
            </span>
            <h1 className="mx-auto mt-4 max-w-5xl text-[2rem] font-black leading-[1.04] tracking-tight sm:mt-5 sm:text-[3.4rem] lg:text-[4.2rem]">
              Powering Industries with World-Class Machinery
            </h1>
            <p className="mt-4 text-[0.95rem] font-bold leading-7 text-sky-50/95 sm:mt-5 sm:text-[1.05rem]">
              Novatech Machinery Corporation (OPC) Private Limited
            </p>
            <p className="mx-auto mt-2.5 max-w-4xl text-[0.9rem] leading-7 text-sky-50/88 sm:mt-3 sm:text-[1.05rem] sm:leading-8">
              Your trusted partner for used and new metal working and industrial
              machinery sourced globally, tested rigorously, and delivered reliably.
            </p>
          </div>
        </section>

        <section className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1740px] gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="relative overflow-hidden border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:p-6"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 bg-slate-100/80" />
                  <div className="relative flex h-full items-start gap-4 sm:gap-5">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center bg-sky-50 text-sky-700 sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 self-center">
                      <p className="text-[1.9rem] font-black leading-none text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[0.72rem] font-black uppercase tracking-[0.14em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="mx-auto max-w-[1740px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="grid lg:grid-cols-[120px_minmax(0,1fr)]">
              <div className="hidden border-r border-slate-200 bg-[linear-gradient(180deg,#f7fbff_0%,#edf4fb_100%)] lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-8">
                <span className="h-2.5 w-2.5 bg-sky-300" />
                <span className="h-16 w-px bg-slate-200" />
                <span className="h-2.5 w-2.5 bg-sky-400" />
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="text-center">
                  <h2 className="text-[1.2rem] font-black uppercase tracking-[0.08em] text-[#0b67a3] sm:text-[1.45rem]">
                    About Novatech Machinery
                  </h2>
                </div>

                <div className="mt-6 space-y-5 text-[1rem] leading-8 text-slate-700">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 pt-4 sm:px-6 lg:px-8 lg:pb-20">
          <div className="mx-auto grid max-w-[1740px] gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <div>
              <div className="mb-4 flex items-start gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center bg-sky-700 text-white">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-[1.9rem] font-black text-slate-950">Why Choose Us?</h2>
                  <p className="text-sm text-slate-500">What sets us apart</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {reasons.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-sky-700">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <h3 className="text-[1rem] font-black text-slate-950">{item.title}</h3>
                          <p className="mt-1.5 text-sm leading-7 text-slate-600">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="bg-[linear-gradient(180deg,#265f92_0%,#2a5f90_100%)] p-5 text-white shadow-[0_20px_42px_rgba(20,91,147,0.18)]">
              <div>
                <p className="text-[0.76rem] font-black uppercase tracking-[0.22em] text-sky-100">
                  Our Machine Range
                </p>
                <p className="mt-1 text-sm text-sky-100/86">
                  Comprehensive industrial machinery catalog
                </p>
              </div>

              <div className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-2">
                {machineRangeColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="space-y-3">
                    {column.map((item, itemIndex) => {
                      const serialNumber = columnIndex * 7 + itemIndex + 1;

                      return (
                        <div
                          key={item}
                          className="grid grid-cols-[26px_1fr] gap-2 text-sm leading-6 text-sky-50/92"
                        >
                          <span className="text-[0.68rem] font-black tracking-[0.08em] text-sky-200/80">
                            {serialNumber.toString().padStart(2, "0")}
                          </span>
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-white/18 pt-4">
                <div className="flex items-start gap-2 text-sm text-sky-50/88">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Office No. 621, 6th Floor, Jubilee Walk, Sector 70, Mohali, Punjab, India</span>
                </div>

                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-black text-sky-800 transition hover:bg-sky-50"
                >
                  Get in Touch
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
