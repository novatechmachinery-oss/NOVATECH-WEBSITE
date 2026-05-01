import ContactPageClient from "@/components/ContactPageClient";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";
import { getSiteSettings } from "@/lib/site-settings.service";

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
