import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";

export const revalidate = 300;

const lastUpdated = "June 8, 2026";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/terms-of-service", {
    fallbackTitle: "Terms of Service",
    fallbackDescription:
      "Terms of Service for Novatech Machinery Corporation (OPC) Private Limited covering website use, machinery enquiries, quotations, availability, and business communication.",
    fallbackKeywords: ["terms of service", "novatech machinery terms", "industrial machinery website terms"],
  });
}

export default async function TermsOfServicePage() {
  const [settings, breadcrumbSchema] = await Promise.all([
    getSiteSettings(),
    getBreadcrumbSchema("/terms-of-service"),
  ]);
  const company = "Novatech Machinery Corporation (OPC) Private Limited";
  const contact = settings.contact;

  const sections = [
    {
      title: "Use of This Website",
      body: [
        "This website provides information about used and industrial machinery, sourcing support, special deals, categories, contact options, and enquiry channels operated by Novatech Machinery Corporation (OPC) Private Limited.",
        "By using this website or submitting an enquiry, you agree to use the website for lawful business purposes and not misuse, disrupt, copy, scrape, or interfere with website functionality.",
      ],
    },
    {
      title: "Machinery Listings and Availability",
      body: [
        "Machine listings, photographs, specifications, descriptions, and availability are provided for general business information. Listings may be updated, corrected, reserved, withdrawn, or sold without prior notice.",
        "While we aim to keep information accurate, used machinery details may depend on supplier information, inspection records, previous ownership, and current stock status. Buyers should verify all key details before making a purchase decision.",
      ],
    },
    {
      title: "Quotations and Commercial Terms",
      body: [
        "Prices, quotations, delivery timelines, inspection arrangements, export support, loading, taxes, duties, and payment terms are subject to written confirmation by our team.",
        "No website listing, message, or displayed detail should be treated as a binding offer unless confirmed in a formal written quotation, proforma invoice, purchase order, or agreement.",
      ],
    },
    {
      title: "Buyer Responsibility",
      body: [
        "Industrial machinery buyers are responsible for reviewing machine condition, technical suitability, safety requirements, power requirements, tooling, installation needs, import requirements, and local compliance before purchase.",
        "We recommend physical inspection, video inspection, third-party inspection, or technical verification whenever appropriate for used machinery transactions.",
      ],
    },
    {
      title: "Communication and Enquiries",
      body: [
        "When you contact us through forms, email, phone, WhatsApp, or newsletter channels, you agree that we may respond using the contact details provided by you.",
        "You are responsible for ensuring that enquiry information, contact details, machine requirements, and business details submitted to us are accurate and authorised.",
      ],
    },
    {
      title: "Intellectual Property",
      body: [
        "Website content, branding, page layouts, text, catalog structure, and visual presentation are owned by or licensed to Novatech Machinery Corporation (OPC) Private Limited unless otherwise stated.",
        "You may not reproduce, republish, commercially exploit, or create misleading copies of website content without written permission.",
      ],
    },
    {
      title: "Third-Party Services and Links",
      body: [
        "The website may include links or integrations for WhatsApp, maps, analytics, email, phone links, or third-party service providers. These services may operate under their own terms and privacy practices.",
        "We are not responsible for external websites or third-party platforms that are not controlled by us.",
      ],
    },
    {
      title: "Limitation of Liability",
      body: [
        "To the fullest extent permitted by applicable law, we are not liable for indirect, incidental, consequential, or business loss arising from website use, delayed communication, unavailable listings, technical errors, or reliance on preliminary listing information.",
        "Nothing in these terms limits responsibilities that cannot be excluded under applicable law.",
      ],
    },
    {
      title: "Governing Law",
      body: [
        "These terms are governed by the laws of India. Any dispute relating to website use or online enquiry communication will be subject to applicable jurisdiction in Punjab, India, unless otherwise agreed in writing.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main>
        <section className="bg-[linear-gradient(135deg,#123f67_0%,#1e5f95_48%,#0d2f50_100%)] px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-[0.76rem] font-black uppercase tracking-[0.22em] text-sky-100">
              Legal
            </p>
            <h1 className="mt-4 text-[2.35rem] font-black leading-tight tracking-tight sm:text-[3.2rem]">
              Terms of Service
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-sky-50/88">
              These terms describe the conditions for using our website, submitting machinery
              enquiries, and communicating with {company}.
            </p>
            <p className="mt-4 text-sm font-semibold text-sky-100/90">Last updated: {lastUpdated}</p>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {sections.map((section) => (
                <article key={section.title} className="border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
                  <h2 className="text-xl font-black text-[#163d6b]">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-[0.98rem] leading-7 text-slate-600">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <h2 className="text-lg font-black text-slate-950">Business Contact</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>{company}</p>
                <p>{contact.officeAddress}</p>
                <p>
                  Email:{" "}
                  <a href={`mailto:${contact.emailAddress}`} className="font-semibold text-[#16548b] hover:underline">
                    {contact.emailAddress}
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a href={`tel:${contact.phonePrimary.replace(/\s+/g, "")}`} className="font-semibold text-[#16548b] hover:underline">
                    {contact.phonePrimary}
                  </a>
                </p>
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <p>
                  Please also review our{" "}
                  <Link href="/privacy-policy" className="font-semibold text-[#16548b] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
