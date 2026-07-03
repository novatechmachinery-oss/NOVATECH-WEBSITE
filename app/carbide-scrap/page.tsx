import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    fallbackDescription:
      "Carbide scrap sourcing and purchasing from Novatech Machinery. Share your carbide scrap requirements through our enquiry form.",
    fallbackKeywords: [
      "carbide scrap",
      "tungsten carbide scrap",
      "carbide scrap buyer",
      "industrial carbide scrap",
    ],
  });
}

export default async function CarbideScrapPage() {
  const breadcrumbSchema = await getBreadcrumbSchema("/carbide-scrap");

  return (
    <div className="bg-white text-slate-950">
      <SiteHeader />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="relative isolate grid w-full gap-0 overflow-hidden bg-white px-2 py-0 before:pointer-events-none before:absolute before:right-0 before:top-0 before:hidden before:h-full before:w-[36%] before:bg-[linear-gradient(155deg,#082d4c_0%,#06436d_48%,#0b5f8c_100%)] before:content-[''] before:[clip-path:polygon(28%_0,100%_0,100%_100%,48%_100%,0_46%)] sm:px-3 lg:px-4 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:px-5 xl:before:block 2xl:px-6">
        <header className="relative z-10 xl:col-start-1 xl:row-start-1">
          <p className="flex items-center gap-4 text-[0.82rem] font-black uppercase tracking-[0.2em] text-[#145b93] sm:text-sm">
            <span className="h-0.5 w-12 bg-[#E32636]" />
            Carbide Scrap
            <span className="h-0.5 w-12 bg-[#E32636]" />
          </p>
          <h1 className="mt-5 text-[2.349rem] font-black leading-[0.93] tracking-[-0.04em] text-[#073b5c] sm:text-[3.24rem] xl:text-[3.969rem]">
            Coming Soon
          </h1>
          <span className="mt-7 block h-1 w-32 bg-[#145b93]" />
        </header>


        <article className="relative z-10 order-2 lg:order-none rounded-xl bg-[linear-gradient(135deg,#edf7fc_0%,#f8fbfd_100%)] p-5 shadow-[0_12px_34px_rgba(20,91,147,0.1)] sm:p-6 xl:col-start-1 xl:row-start-2">

          <h2 className="max-w-xl text-2xl font-black leading-tight text-[#071c3c] sm:text-[1.8rem]">
            Have a carbide scrap requirement now?
          </h2>
          <span className="mt-3 block h-0.5 w-16 bg-[#E32636]" />
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            You do not need to wait for this catalogue to launch. Send your material
            specifications, expected quantity and contact details through our enquiry
            form.
          </p>
          <Link
            href="/contact#enquiry-form"
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#df202c] px-6 py-3 text-sm font-black uppercase tracking-[0.07em] text-white shadow-[0_12px_26px_rgba(223,32,44,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c71925]"
          >
            Go to contact form
            <ArrowRight className="h-5 w-5" />
          </Link>
        </article>

        <aside className="relative z-10 order-1 grid w-full max-w-[780px] grid-cols-2 gap-0 self-center justify-self-center rounded-xl bg-white p-0 sm:grid-cols-3 sm:p-0 md:p-0 lg:order-none xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:justify-self-end xl:rounded-none xl:bg-white xl:p-0 xl:-skew-x-2">
          {carbideScrapImages.map((src, index) => (
            <figure
              key={src}
              className={
                "group relative aspect-[4/3] overflow-hidden rounded-none border-0 bg-slate-200 shadow-none " +
                (index === 0 ? "xl:rounded-tl-[30px] " : "") +
                (index === 2 ? "xl:rounded-tr-[30px] " : "") +
                (index === 3 ? "xl:rounded-bl-[30px] " : "") +
                (index === 5 ? "xl:rounded-br-[30px] " : "")
              }
            >
              <Image
                src={src}
                alt={"Carbide scrap material " + (index + 1)}
                fill
                priority={index < 3}
                sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px"
                className="object-cover transition duration-500 group-hover:scale-105 xl:skew-x-2 xl:scale-105 xl:group-hover:scale-110"
              />
            </figure>
          ))}
        </aside>

      </main>

      <Footer />
    </div>
  );
}
