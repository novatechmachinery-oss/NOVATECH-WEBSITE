import "server-only";

import type { MachineItem } from "@/lib/machines";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { getSeoConfig } from "@/lib/seo/seo-config";
import { getSiteSettings } from "@/lib/site-settings.service";

export async function getGlobalSchemas() {
  const [config, siteSettings] = await Promise.all([getSeoConfig(), getSiteSettings()]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.siteName,
    url: config.baseUrl,
    email: siteSettings.contact.emailAddress,
    telephone: siteSettings.contact.phonePrimary,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.contact.officeAddress,
      addressCountry: "IN",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.siteName,
    url: config.baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${config.baseUrl}/used-machinery?category={category}`,
      "query-input": "required name=category",
    },
  };

  return { organization, website };
}

export async function getLocalBusinessSchema() {
  const [config, siteSettings] = await Promise.all([getSeoConfig(), getSiteSettings()]);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config.siteName,
    url: config.baseUrl,
    image: `${config.baseUrl}/images/MAIN%20LOGO.png`,
    telephone: siteSettings.contact.phonePrimary,
    email: siteSettings.contact.emailAddress,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.contact.officeAddress,
      addressCountry: "IN",
    },
  };
}

export async function getBreadcrumbSchema(pathnameWithQuery: string) {
  const crumbs = await generateBreadcrumbs(pathnameWithQuery);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export async function getItemListSchema(
  pathnameWithQuery: string,
  title: string,
  items: Array<{ name: string; url: string }>,
) {
  const { baseUrl } = await getSeoConfig();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    url: `${baseUrl}${pathnameWithQuery}`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export async function getProductSchema(machine: MachineItem) {
  const { baseUrl } = await getSeoConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: machine.title,
    description: machine.description || `${machine.title} available at Novatech Machinery`,
    image: [machine.imageSrc.startsWith("http") ? machine.imageSrc : `${baseUrl}${machine.imageSrc}`],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      price: "0",
      url: `${baseUrl}/used-machinery?machine=${encodeURIComponent(machine.id)}`,
    },
  };
}

export async function getFaqSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

