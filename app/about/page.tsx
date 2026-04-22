"use client";

import SiteHeader from "../../components/SiteHeader";
import Footer from "../../components/Footer";
import MachineCard from "../../components/Cards/MachineCard";
import {
  Globe,
  Factory,
  ShieldCheck,
  Wrench,
  Cog,
  Building2,
  Users,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main className="space-y-8 px-4 py-4 sm:px-5 lg:px-6 xl:px-8">
        <section className="bg-gradient-to-b from-slate-100 to-white text-slate-900">


      {/* HERO */}
      <div className="bg-gradient-to-r from-[#1f4568] to-[#2f5d87] text-white px-6 md:px-14 py-16 md:py-24">
        <div className="max-w-7xl mx-auto text-center">

          <span className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold tracking-wide mb-5">
            INDUSTRIAL EXCELLENCE
          </span>

          <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-5xl mx-auto">
            Trusted Partner For Used & New Industrial Machinery
          </h1>

          <p className="mt-5 text-lg md:text-xl font-semibold text-slate-100">
            Novatech Machinery Corporation (OPC) Private Limited
          </p>

          <p className="mt-4 text-base md:text-lg text-slate-200 max-w-4xl mx-auto leading-relaxed">
            Specialized in import, export, sourcing and supply of CNC &
            Conventional Machines from Europe, USA and global markets.
            Reliable quality, fair pricing and complete customer support.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-10 relative z-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <Globe className="w-8 h-8 text-[#2f5d87] mb-4" />
            <h3 className="text-3xl font-black">Europe & USA</h3>
            <p className="text-slate-600 font-medium mt-1">
              Global Machinery Sourcing
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <Factory className="w-8 h-8 text-[#2f5d87] mb-4" />
            <h3 className="text-3xl font-black">50+</h3>
            <p className="text-slate-600 font-medium mt-1">
              Machine Categories
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <Cog className="w-8 h-8 text-[#2f5d87] mb-4" />
            <h3 className="text-3xl font-black">CNC + Manual</h3>
            <p className="text-slate-600 font-medium mt-1">
              Complete Range Available
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <ShieldCheck className="w-8 h-8 text-[#2f5d87] mb-4" />
            <h3 className="text-3xl font-black">100%</h3>
            <p className="text-slate-600 font-medium mt-1">
              Quality Focused Supply
            </p>
          </div>

        </div>
      </div>

      {/* ABOUT */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16">
        <div className="bg-white rounded-3xl shadow-md p-8 md:p-12">

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#2f5d87] text-white flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-3xl font-black">Company Overview</h2>
              <p className="text-slate-500 font-medium">
                Who We Are & What We Do
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-lg leading-relaxed text-slate-700 font-medium">

            <p>
              Novatech Machinery is engaged in trading, import and export of
              high-quality used and new industrial machinery. The company deals
              in CNC machines as well as conventional workshop machines for
              customers across India and overseas markets.
            </p>

            <p>
              Machines are sourced from trusted European and American markets.
              Every machine is selected carefully to ensure strong performance,
              durability and long service life for production industries.
            </p>

            <p>
              Product range includes CNC Lathes, VMC, HMC, Boring Machines,
              Plano Millers, Presses, Gear Machines, Grinding Machines,
              Fabrication Equipment and complete plant machinery solutions.
            </p>

            <p>
              Focus remains on honest dealing, competitive pricing, smooth
              logistics and long-term customer relationships backed by technical
              support.
            </p>

          </div>
        </div>
      </div>

      {/* WHY CHOOSE */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pb-16">
        <h2 className="text-4xl font-black mb-2">Why Choose Us?</h2>
        <p className="text-slate-600 font-medium mb-8">
          What makes Novatech different
        </p>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {[
            {
              icon: Globe,
              title: "Global Network",
              text: "Direct sourcing from Europe, USA and reliable international suppliers.",
            },
            {
              icon: BadgeCheck,
              title: "Quality Machines",
              text: "Machines selected with focus on condition, accuracy and performance.",
            },
            {
              icon: Wrench,
              title: "Wide Product Range",
              text: "CNC, conventional and complete industrial solutions available.",
            },
            {
              icon: Users,
              title: "Customer Support",
              text: "Quick response and requirement based machine suggestions.",
            },
            {
              icon: ShieldCheck,
              title: "Trusted Dealings",
              text: "Transparent pricing and genuine business commitments.",
            },
            {
              icon: Factory,
              title: "Industry Experience",
              text: "Serving manufacturers, workshops and industrial buyers.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
              >
                <Icon className="w-8 h-8 text-[#2f5d87] mb-4" />
                <h3 className="text-xl font-black mb-2">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}

        </div>
      </div>

      {/* MACHINE RANGE */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pb-16">
        <div className="bg-[#1f4568] rounded-3xl text-white p-8 md:p-12">

          <h2 className="text-4xl font-black mb-3">Our Machine Range</h2>
          <p className="text-slate-200 mb-8 text-lg">
            Comprehensive machinery supply for industrial needs
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-lg font-medium">

            <p>• CNC Turning Centers & CNC Lathes</p>
            <p>• Vertical Machining Centers (VMC)</p>
            <p>• Horizontal Machining Centers (HMC)</p>
            <p>• Horizontal Boring Machines</p>
            <p>• Vertical Turret Lathes (VTL)</p>
            <p>• Plano Millers & Portal Millers</p>
            <p>• Grinding Machines</p>
            <p>• Gear Hobbing / Gear Machines</p>
            <p>• Presses & Forging Machines</p>
            <p>• Textile / Pharma Machinery</p>

          </div>

          <button className="mt-10 bg-white text-[#1f4568] px-7 py-3 rounded-xl font-black hover:bg-slate-100 transition inline-flex items-center gap-2">
            Get In Touch <ArrowRight size={18} />
          </button>

        </div>
      </div>

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
