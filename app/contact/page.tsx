import type { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";
import { getSiteSettings } from "@/lib/site-settings.service";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/contact", {
    fallbackTitle: "Contact Novatech Machinery",
    fallbackDescription:
      "Contact Novatech Machinery for used industrial machines, sourcing support, quotations, and machinery enquiries.",
    fallbackKeywords: [
      "contact novatech machinery",
      "industrial machine enquiry",
      "used machinery quote",
    ],
  });
}

export default async function ContactPage() {
  const [settings, breadcrumbSchema] = await Promise.all([
    getSiteSettings(),
    getBreadcrumbSchema("/contact"),
  ]);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactPageClient settings={settings.contact} />
      <Footer />
    </div>
  );
}
