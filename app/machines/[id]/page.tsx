import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CircleDollarSign, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import MachineImageGallery from "@/components/MachineImageGallery";
import SiteHeader from "@/components/SiteHeader";
import JsonLd from "@/components/seo/JsonLd";
import TrackedLink from "@/components/seo/TrackedLink";
import { getMachineBySlug, getMachineById, getMachineInventory } from "@/lib/machines";
import { getMachinePath } from "@/lib/machine-urls";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getMachineBreadcrumbSchema, getProductSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";
import { REQUEST_PRICE_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { redirect } from "next/navigation";

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

function WhatsAppBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 3.5a8.43 8.43 0 0 0-7.24 12.75L3.88 20l3.85-.9A8.42 8.42 0 1 0 12.04 3.5Zm0 15.36a6.9 6.9 0 0 1-3.52-.96l-.25-.15-2.27.53.54-2.22-.16-.26a6.9 6.9 0 1 1 5.66 3.06Zm3.8-5.15c-.2-.1-1.2-.6-1.39-.66-.19-.07-.33-.1-.47.1-.14.2-.54.66-.66.8-.12.14-.24.15-.44.05-.2-.1-.86-.32-1.64-1.02-.61-.54-1.02-1.21-1.14-1.41-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.14-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.47-1.13-.64-1.55-.17-.4-.34-.35-.47-.36h-.4c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.14 1.46 2.23 3.54 3.12.49.21.88.34 1.18.44.5.16.95.14 1.31.08.4-.06 1.2-.49 1.37-.96.17-.47.17-.88.12-.96-.05-.08-.19-.13-.39-.23Z" />
    </svg>
  );
}

export async function generateMetadata({ params }: MachinePageProps): Promise<Metadata> {
  const { id } = await params;
  const idOrSlug = decodeURIComponent(id);

  // Try slug first, then fall back to ID for backward compat
  const machine =
    (await getMachineBySlug(idOrSlug)) ?? (await getMachineById(idOrSlug));

  if (!machine) {
    return generatePageMetadata(`/machines/${idOrSlug}`, {
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
  const idOrSlug = decodeURIComponent(id);

  // Try slug first
  let machine = await getMachineBySlug(idOrSlug);
  let isOldIdUrl = false;

  if (!machine) {
    // Fall back to ID lookup (old URL format like /machines/machine_9l115xpm)
    machine = await getMachineById(idOrSlug);
    if (machine) isOldIdUrl = true;
  }

  if (!machine) notFound();

  // Redirect old ID-based URLs to new slug URLs (301)
  if (isOldIdUrl) {
    redirect(getMachinePath(machine));
  }

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
  const requestPriceHref = `https://wa.me/${REQUEST_PRICE_WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Please share the best price for ${machine.title} (${getMachinePath(machine)})`,
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
              <div className="border-b border-slate-200 pb-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                  {machine.subcategory || machine.category}
                </p>
                <div className="mt-2 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                  <div className="min-w-0 2xl:flex-1">
                    <h1 className="break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                      {machine.title}
                    </h1>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[560px]:grid-cols-3 2xl:w-[560px] 2xl:shrink-0">
                    <TrackedLink
                      eventName="contact_whatsapp"
                      eventContext={machine.category}
                      href={requestPriceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-[64px] min-w-0 items-stretch rounded-[0.45rem] border border-[#145b93] bg-[#145b93] py-1 text-left text-white shadow-[0_12px_24px_rgba(20,91,147,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0f4c7c] hover:shadow-[0_16px_28px_rgba(20,91,147,0.24)]"
                    >
                    <span className="flex w-[30%] shrink-0 items-center justify-center">
                      <CircleDollarSign className="h-9 w-9" />
                    </span>
                    <span className="min-w-0 flex-1 self-center leading-tight">
                      <span className="block truncate text-[0.78rem] font-black uppercase tracking-[0.02em]">Request Price</span>
                      <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-sky-100">Get Best Quote</span>
                    </span>
                    <ChevronRight className="mr-2 h-4 w-4 shrink-0 self-center opacity-80 transition group-hover:translate-x-0.5" />
                    </TrackedLink>
                    <TrackedLink
                      eventName="contact_whatsapp"
                      eventContext={machine.category}
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-[64px] min-w-0 items-stretch rounded-[0.45rem] border border-slate-200 bg-white py-1 text-left text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_16px_28px_rgba(16,185,129,0.14)]"
                    >
                    <span className="flex w-[30%] shrink-0 items-center justify-center text-emerald-600">
                      <WhatsAppBrandIcon className="h-9 w-9" />
                    </span>
                    <span className="min-w-0 flex-1 self-center leading-tight">
                      <span className="block truncate text-[0.78rem] font-black uppercase tracking-[0.02em]">WhatsApp</span>
                      <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-slate-500">Chat With Us</span>
                    </span>
                    <ChevronRight className="mr-2 h-4 w-4 shrink-0 self-center text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </TrackedLink>
                    <TrackedLink
                      eventName="contact_phone"
                      eventContext={machine.category}
                      href={`tel:${settings.contact.phonePrimary.replace(/\s+/g, "")}`}
                      className="group inline-flex min-h-[64px] min-w-0 items-stretch rounded-[0.45rem] border border-slate-200 bg-white py-1 text-left text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_16px_28px_rgba(14,165,233,0.14)]"
                    >
                    <span className="flex w-[30%] shrink-0 items-center justify-center text-[#145b93]">
                      <Phone className="h-9 w-9" />
                    </span>
                    <span className="min-w-0 flex-1 self-center leading-tight">
                      <span className="block truncate text-[0.78rem] font-black uppercase tracking-[0.02em]">Call Now</span>
                      <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-slate-500">Speak to Expert</span>
                    </span>
                    <ChevronRight className="mr-2 h-4 w-4 shrink-0 self-center text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#145b93]" />
                    </TrackedLink>
                  </div>
                </div>
              </div>
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
