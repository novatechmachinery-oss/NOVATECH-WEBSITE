import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import MachineImageGallery from "@/components/MachineImageGallery";
import SiteHeader from "@/components/SiteHeader";
import JsonLd from "@/components/seo/JsonLd";
import TrackedLink from "@/components/seo/TrackedLink";
import { getMachineById, getMachineInventory } from "@/lib/machines";
import { getMachinePath } from "@/lib/machine-urls";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getMachineBreadcrumbSchema, getProductSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";

export const revalidate = 300;

type MachinePageProps = {
  params: Promise<{ id: string }>;
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maximum = 158) {
  const text = cleanText(value);
  if (text.length <= maximum) return text;
  return `${text.slice(0, maximum - 1).replace(/\s+\S*$/, "")}…`;
}

function machineTitle(name: string, brand?: string) {
  const includesBrand = brand && name.toLowerCase().includes(brand.toLowerCase());
  return `${name} for Sale${brand && !includesBrand ? ` | ${brand}` : ""}`;
}

export async function generateMetadata({ params }: MachinePageProps): Promise<Metadata> {
  const { id } = await params;
  const machine = await getMachineById(decodeURIComponent(id));

  if (!machine) {
    return generatePageMetadata(getMachinePath(id), {
      fallbackTitle: "Machine Not Found",
      fallbackDescription: "The requested machine is not available.",
      noIndex: true,
    });
  }

  const details = [
    machine.manufacturer,
    machine.model,
    machine.condition,
    machine.subcategory || machine.category,
  ].filter(Boolean);
  const description = truncate(
    `${machine.title}${details.length ? ` — ${details.join(", ")}` : ""}. ${
      machine.description || "Contact Novatech Machinery for specifications and an enquiry."
    }`,
  );

  return generatePageMetadata(getMachinePath(machine), {
    fallbackTitle: machineTitle(machine.title, machine.manufacturer),
    fallbackDescription: description,
    canonicalRoute: getMachinePath(machine),
    openGraphImage: machine.imageSrc,
  });
}

export default async function MachinePage({ params }: MachinePageProps) {
  const { id } = await params;
  const machine = await getMachineById(decodeURIComponent(id));
  if (!machine) notFound();

  const [inventory, settings, productSchema, breadcrumbSchema] = await Promise.all([
    getMachineInventory(),
    getSiteSettings(),
    getProductSchema(machine),
    getMachineBreadcrumbSchema(machine),
  ]);
  const images = (machine.images?.length ? machine.images : [machine.imageSrc]).slice(0, 8);
  const related = inventory
    .filter(
      (item) =>
        item.id !== machine.id &&
        (item.subcategoryId === machine.subcategoryId || item.categoryId === machine.categoryId),
    )
    .slice(0, 4);
  const categoryHref = `/used-machinery?category=${encodeURIComponent(
    machine.categorySlug || machine.category,
  )}`;
  const whatsappHref = `https://wa.me/${settings.contact.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    `I am interested in ${machine.title} (${getMachinePath(machine)})`,
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-sky-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/used-machinery" className="hover:text-sky-700">Used Machinery</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={categoryHref} className="hover:text-sky-700">{machine.category}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-slate-900">{machine.title}</li>
          </ol>
        </nav>

        <article className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <section aria-label={`${machine.title} images`} className="border-b border-slate-200 p-3 lg:border-b-0 lg:border-r sm:p-5">
              <MachineImageGallery
                images={images}
                title={machine.title}
                imageAlt={machine.imageAlt}
              />
            </section>

            <section className="p-5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                {machine.subcategory || machine.category}
              </p>
              <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                {machine.title}
              </h1>
              <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200 text-sm">
                {[
                  ["Brand", machine.manufacturer],
                  ["Model", machine.model],
                  ["Condition", machine.condition],
                  ["Stock number", machine.stockNumber],
                ].filter((item): item is [string, string] => Boolean(item[1])).map(([label, value]) => (
                  <div key={label} className="bg-white p-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {machine.description ? (
                <div className="mt-5 space-y-1.5 text-sm leading-6 text-slate-700">
                  {machine.description
                    .split(/\n+/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, i) => {
                      const colonIdx = line.indexOf(":");
                      if (colonIdx > 0 && colonIdx < 40) {
                        const label = line.slice(0, colonIdx).trim();
                        const value = line.slice(colonIdx + 1).trim();
                        return (
                          <div key={i} className="flex gap-2">
                            <span className="min-w-[130px] font-semibold text-slate-800">{label}:</span>
                            <span>{value}</span>
                          </div>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                </div>
              ) : null}
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                <TrackedLink eventName="contact_whatsapp" eventContext={machine.category} href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700">WhatsApp</TrackedLink>
                <TrackedLink eventName="contact_phone" eventContext={machine.category} href={`tel:${settings.contact.phonePrimary.replace(/\s+/g, "")}`} className="inline-flex min-h-11 items-center justify-center bg-[#145b93] px-4 text-sm font-black text-white hover:bg-[#0f4f7f]">Call Now</TrackedLink>
                <TrackedLink eventName="contact_email" eventContext={machine.category} href={`/contact`} className="inline-flex min-h-11 items-center justify-center border border-[#145b93] px-4 text-sm font-black text-[#145b93] hover:bg-sky-50">Email Enquiry</TrackedLink>
              </div>
            </section>
          </div>

          {machine.specifications?.length ? (
            <section className="border-t border-slate-200 p-5 sm:p-7">
              <h2 className="text-xl font-black">Machine specifications</h2>
              <dl className="mt-4 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2">
                {machine.specifications.map((spec, idx) => (
                  <div key={`${spec.label}-${spec.value}-${idx}`} className="grid grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] bg-white p-3 text-sm">
                    <dt className="font-bold text-slate-600">{spec.label}</dt>
                    <dd className="break-words text-slate-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </article>

        {related.length ? (
          <section className="mt-8" aria-labelledby="related-machines">
            <h2 id="related-machines" className="text-xl font-black">Related machines</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} href={getMachinePath(item)} className="group overflow-hidden border border-slate-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image src={item.imageSrc} alt={item.imageAlt || item.title} fill loading="lazy" unoptimized={/^https?:\/\//i.test(item.imageSrc)} sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-black leading-snug group-hover:text-sky-700">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.manufacturer || item.subcategory || item.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
