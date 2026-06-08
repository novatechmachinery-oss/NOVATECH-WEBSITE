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
  return generatePageMetadata("/privacy-policy", {
    fallbackTitle: "Privacy Policy",
    fallbackDescription:
      "Privacy Policy for Novatech Machinery Corporation (OPC) Private Limited covering enquiries, contact forms, newsletter subscriptions, and machinery sourcing communication.",
    fallbackKeywords: ["privacy policy", "novatech machinery privacy", "industrial machinery enquiry privacy"],
  });
}

export default async function PrivacyPolicyPage() {
  const [settings, breadcrumbSchema] = await Promise.all([
    getSiteSettings(),
    getBreadcrumbSchema("/privacy-policy"),
  ]);
  const company = "Novatech Machinery Corporation (OPC) Private Limited";
  const contact = settings.contact;

  const sections = [
    {
      title: "Information We Collect",
      body: [
        "We may collect information you submit through enquiry forms, contact forms, newsletter forms, WhatsApp links, email, phone calls, and quotation requests. This may include your name, company name, email address, phone number, location, machine interest, message details, and communication preferences.",
        "We may also receive basic technical information such as browser type, approximate device information, page interactions, analytics events, and website performance data to help us improve the website experience.",
      ],
    },
    {
      title: "How We Use Information",
      body: [
        "We use information to respond to machinery enquiries, share quotations, coordinate machine availability, support inspection or export discussions, send requested updates, improve our catalogue, prevent misuse, and maintain business records.",
        "If you subscribe to email or WhatsApp updates, we use your contact details to send machine arrivals, special deals, and sourcing updates. You may request removal from these updates at any time.",
      ],
    },
    {
      title: "Sharing of Information",
      body: [
        "We do not sell personal information. We may share relevant enquiry details with our internal team, service providers, logistics or inspection partners, and machinery sourcing partners only when necessary to respond to your request or support a business transaction.",
        "We may disclose information if required by law, regulation, legal process, or to protect our rights, users, website, and business operations.",
      ],
    },
    {
      title: "Data Security and Retention",
      body: [
        "We use reasonable technical and organisational measures to protect enquiry and contact information from unauthorised access, misuse, alteration, or loss.",
        "We retain information only for as long as reasonably necessary for enquiry follow-up, business records, legal obligations, dispute resolution, and operational purposes.",
      ],
    },
    {
      title: "Cookies and Analytics",
      body: [
        "Our website may use cookies, analytics tags, and similar technologies to understand page performance, visitor behaviour, campaign effectiveness, and website reliability.",
        "You can control cookies through your browser settings. Some website features may not function optimally if cookies are disabled.",
      ],
    },
    {
      title: "Your Choices",
      body: [
        "You may contact us to request access, correction, update, or deletion of your personal information, subject to applicable legal and business record requirements.",
        "You may also opt out of promotional email or WhatsApp updates by contacting us using the details below.",
      ],
    },
    {
      title: "International Business Communication",
      body: [
        "Because industrial machinery sourcing may involve international sellers, buyers, inspection teams, and logistics providers, enquiry details may be communicated across regions where necessary for the requested business purpose.",
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
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-sky-50/88">
              This policy explains how {company} handles information collected through our website,
              machinery enquiry channels, and business communication.
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
              <h2 className="text-lg font-black text-slate-950">Contact for Privacy Requests</h2>
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
                  <Link href="/terms-of-service" className="font-semibold text-[#16548b] hover:underline">
                    Terms of Service
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
