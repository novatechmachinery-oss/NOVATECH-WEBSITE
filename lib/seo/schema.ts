import "server-only";

import type { MachineItem } from "@/lib/machines";
import { getMachinePath } from "@/lib/machine-urls";
import { generateBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { getSeoConfig } from "@/lib/seo/seo-config";
import { getSiteSettings } from "@/lib/site-settings.service";

export async function getGlobalSchemas() {
  const [config, siteSettings] = await Promise.all([getSeoConfig(), getSiteSettings()]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${config.baseUrl}/#organization`,
    name: config.siteName,
    url: config.baseUrl,
    description: config.defaultDescription,
    email: siteSettings.contact.emailAddress,
    telephone: siteSettings.contact.phonePrimary,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.contact.officeAddress,
      addressLocality: "Mohali",
      addressRegion: "Punjab",
      addressCountry: "IN",
    },
    logo: {
      "@type": "ImageObject",
      url: `${config.baseUrl}/images/MAIN%20LOGO.png`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: siteSettings.contact.phonePrimary,
      email: siteSettings.contact.emailAddress,
      areaServed: "IN",
      availableLanguage: ["English", "Hindi", "Punjabi"],
    },
    areaServed: [
      { "@type": "State", name: "Punjab" },
      { "@type": "State", name: "Haryana" },
      { "@type": "State", name: "Delhi" },
      { "@type": "State", name: "Rajasthan" },
      { "@type": "State", name: "Maharashtra" },
      { "@type": "State", name: "Gujarat" },
      { "@type": "State", name: "Uttar Pradesh" },
      { "@type": "Country", name: "India" },
    ],
    knowsAbout: [
      "Used Industrial Machinery",
      "CNC Machines",
      "Metal Working Machinery",
      "Used Lathes",
      "Boring Mills",
      "Milling Machines",
      "Pharmaceutical Machinery",
      "Textile Machinery",
      "Plastic Machinery",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${config.baseUrl}/#website`,
    name: config.siteName,
    url: config.baseUrl,
    publisher: { "@id": `${config.baseUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${config.baseUrl}/used-machinery?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return { organization, website };
}

export async function getLocalBusinessSchema() {
  const [config, siteSettings] = await Promise.all([getSeoConfig(), getSiteSettings()]);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${config.baseUrl}/#localbusiness`,
    name: config.siteName,
    url: config.baseUrl,
    image: `${config.baseUrl}/images/MAIN%20LOGO.png`,
    telephone: siteSettings.contact.phonePrimary,
    email: siteSettings.contact.emailAddress,
    description: config.defaultDescription,
    parentOrganization: { "@id": `${config.baseUrl}/#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.contact.officeAddress,
      addressLocality: "Mohali",
      addressRegion: "Punjab",
      postalCode: "160071",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.7046,
      longitude: 76.7179,
    },
    hasMap: "https://maps.google.com/?q=Novatech+Machinery+Mohali+Punjab",
    priceRange: "₹₹",
    areaServed: [
      { "@type": "City", name: "Mohali" },
      { "@type": "City", name: "Chandigarh" },
      { "@type": "City", name: "Ludhiana" },
      { "@type": "City", name: "Amritsar" },
      { "@type": "City", name: "Jalandhar" },
      { "@type": "City", name: "Delhi" },
      { "@type": "City", name: "Mumbai" },
      { "@type": "City", name: "Pune" },
      { "@type": "City", name: "Ahmedabad" },
      { "@type": "City", name: "Hyderabad" },
      { "@type": "State", name: "Punjab" },
      { "@type": "State", name: "Haryana" },
      { "@type": "Country", name: "India" },
    ],
    sameAs: [
      "https://www.facebook.com/novatechmachinery",
      "https://www.indiamart.com/novatechmachinery",
    ],
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
  const url = `${baseUrl}${getMachinePath(machine)}`;

  const condition = machine.condition?.toLowerCase();
  const itemCondition = condition?.includes("refurb")
    ? "https://schema.org/RefurbishedCondition"
    : condition?.includes("used")
      ? "https://schema.org/UsedCondition"
      : condition?.includes("new")
        ? "https://schema.org/NewCondition"
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: machine.title,
    description: machine.description || `${machine.title} available at Novatech Machinery`,
    image: [machine.imageSrc.startsWith("http") ? machine.imageSrc : `${baseUrl}${machine.imageSrc}`],
    brand: machine.manufacturer
      ? {
          "@type": "Brand",
          name: machine.manufacturer,
        }
      : undefined,
    model: machine.model,
    sku: machine.stockNumber || undefined,
    category: machine.subcategory || machine.category,
    itemCondition,
    url,
  };
}

export async function getBreadcrumbListSchema(
  items: Array<{ name: string; path: string }>,
) {
  const { baseUrl } = await getSeoConfig();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${baseUrl}${item.path}`,
    })),
  };
}

export async function getMachineBreadcrumbSchema(machine: MachineItem) {
  const { baseUrl } = await getSeoConfig();
  const categoryUrl = `${baseUrl}/used-machinery?category=${encodeURIComponent(
    machine.categorySlug || machine.category,
  )}`;
  const machineUrl = `${baseUrl}${getMachinePath(machine)}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "Used Machinery", item: `${baseUrl}/used-machinery` },
      { "@type": "ListItem", position: 3, name: machine.category, item: categoryUrl },
      { "@type": "ListItem", position: 4, name: machine.title, item: machineUrl },
    ],
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

