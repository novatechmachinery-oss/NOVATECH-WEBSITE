import type { Metadata } from "next";
import Image from "next/image";

import CarbideEnquiryForm from "@/components/CarbideEnquiryForm";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const revalidate = 300;

const carbideScrapImages = [
  "/images/carbide%20scrap.jpg",
  "/images/carbide%20scrap2.jpg",
  "/images/carbide%20scrap3.jpg",
  "/images/carbide%20scrap4.jpg",
  "/images/carbide%20scrap5.jpg",
  "/images/carbide%20scrap6.jpg",
];

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/carbide-scrap", {
    fallbackTitle: "Carbide Scrap",
    fallbackDescription: "Carbide scrap sourcing and purchasing from Novatech Machinery. Share your carbide scrap requirements through our enquiry form.",
    fallbackKeywords: ["carbide scrap", "tungsten carbide scrap", "carbide scrap buyer", "industrial carbide scrap"],
  });
}

export default async function CarbideScrapPage() {
  const breadcrumbSchema = await getBreadcrumbSchema("/carbide-scrap");

  return (
    <div className="bg-white text-slate-950">
      <SiteHeader />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] px-3 py-8 sm:px-5 sm:py-10 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-[1500px] items-start gap-8 xl:grid-cols-[minmax(340px,0.78fr)_minmax(620px,1.22fr)] xl:gap-10">
          <div>
            <header>
              <p className="flex items-center gap-4 text-[0.82rem] font-black uppercase tracking-[0.2em] text-[#145b93] sm:text-sm">
                <span className="h-0.5 w-12 bg-[#E32636]" />Carbide Scrap<span className="h-0.5 w-12 bg-[#E32636]" />
              </p>
              <h1 className="mt-5 text-[2.35rem] font-black leading-[0.98] tracking-[-0.04em] text-[#073b5c] sm:text-[3.2rem] xl:text-[3.8rem]">
                Have a<br />Carbide Scrap<br /><span className="text-[#df202c]">Requirement?</span>
              </h1>
              <span className="mt-6 block h-1 w-24 bg-[#145b93]" />
            </header>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700">
              Send us your material specifications, expected quantity and contact details through this enquiry form.
            </p>

            <aside className="mt-7 grid w-full grid-cols-2 overflow-hidden rounded-2xl border-[5px] border-[#123f69] bg-white sm:grid-cols-3">
              {carbideScrapImages.map((src, index) => (
                <figure key={src} className="group relative aspect-[4/3] overflow-hidden bg-slate-200">
                  <Image src={src} alt={`Carbide scrap material ${index + 1}`} fill priority={index < 3} sizes="(max-width: 640px) 46vw, (max-width: 1280px) 30vw, 190px" className="object-cover transition duration-500 group-hover:scale-105" />
                </figure>
              ))}
            </aside>
          </div>

          <CarbideEnquiryForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
