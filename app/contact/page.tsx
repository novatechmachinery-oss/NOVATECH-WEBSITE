import type { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { getSeoMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings.service";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/contact", {
    title: "Contact Novatech Machinery",
    description:
      "Contact Novatech Machinery for used industrial machines, sourcing support, quotations, and machinery enquiries.",
    keywords: ["contact novatech machinery", "industrial machine enquiry", "used machinery quote"],
  });
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />
      <ContactPageClient settings={settings.contact} />
      <Footer />
    </div>
  );
}
