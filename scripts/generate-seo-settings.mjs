import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const seoPath = path.join(root, "data", "seo-settings.json");
const catalogPath = path.join(root, "data", "admin-catalog.json");
const sitePath = path.join(root, "data", "site-settings.json");
const envPath = path.join(root, ".env.local");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function uniqueKeywords(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean))).join(", ");
}

function buildRoute(pathname, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function compactSentence(value, maxLength = 155) {
  const cleanValue = String(value || "").replace(/\s+/g, " ").trim();
  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  const truncatedValue = cleanValue
    .slice(0, maxLength - 1)
    .replace(/\s+\S*$/, "")
    .replace(/[,\s;:]+$/, "")
    .replace(/\s+(and|or|with|for|including|under|of|the|a|an)$/i, "")
    .replace(/[,\s;:]+$/, "");

  return `${truncatedValue}.`;
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function getBrandName(siteSettings) {
  const companyName = String(siteSettings.companyName || "").trim();
  if (companyName.toLowerCase().includes("machinery")) {
    return companyName;
  }

  return "Novatech Machinery";
}

function makePage(page) {
  return {
    ogImageUrl: "",
    noIndex: false,
    noFollow: false,
    ...page,
  };
}

function getCategoryContext(category, categoryById) {
  const parent = category && category.parentId ? categoryById.get(category.parentId) : null;
  return {
    mainCategory: parent || category || null,
    subcategory: parent ? category : null,
  };
}

function countMachinesForCategory(category, machines, categoriesByParent) {
  const childIds = new Set((categoriesByParent.get(category.id) || []).map((item) => item.id));
  childIds.add(category.id);
  return machines.filter((machine) => childIds.has(machine.categoryId)).length;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return values;
      }

      const separatorIndex = trimmedLine.indexOf("=");
      if (separatorIndex === -1) {
        return values;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      values[key] = value;
      return values;
    }, {});
}

function getEnvValue(envFileValues, key) {
  return process.env[key] || envFileValues[key] || "";
}

async function syncSeoSettings(settings) {
  const envFileValues = parseEnvFile(envPath);
  const supabaseUrl = getEnvValue(envFileValues, "NEXT_PUBLIC_SUPABASE_URL") || getEnvValue(envFileValues, "VITE_SUPABASE_URL");
  const anonKey = getEnvValue(envFileValues, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = getEnvValue(envFileValues, "SUPABASE_SERVICE_ROLE_KEY") || anonKey;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase env vars are missing. Expected NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/seo_settings`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates, return=minimal",
    },
    body: JSON.stringify([{ id: "main", settings }]),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase SEO sync failed (${response.status}): ${body}`);
  }
}

const currentSeo = readJson(seoPath);
const catalog = readJson(catalogPath);
const siteSettings = readJson(sitePath);

const companyName = getBrandName(siteSettings);
const categories = catalog.categories || [];
const machines = (catalog.machines || []).filter((machine) => machine.stockStatus !== "sold");
const categoryById = new Map(categories.map((category) => [category.id, category]));
const categoriesByParent = new Map();

for (const category of categories) {
  const key = category.parentId || "root";
  const list = categoriesByParent.get(key) || [];
  list.push(category);
  categoriesByParent.set(key, list);
}

const topCategories = (categoriesByParent.get("root") || []).sort((left, right) =>
  left.name.localeCompare(right.name),
);

const corePages = [
  makePage({
    id: "seo-home",
    label: "Home",
    route: "/",
    title: "Used Industrial Machinery and CNC Machines",
    description: `${companyName} supplies used industrial machinery, CNC machines, boring mills, lathes, gear machinery, machining centres, and sourcing support in India.`,
    keywords: uniqueKeywords([
      companyName,
      "used industrial machinery",
      "used CNC machines",
      "used machinery dealer India",
      "industrial machinery supplier",
      "metal working machines",
    ]),
    canonicalUrl: "/",
    ogTitle: `${companyName} | Used Industrial Machinery`,
    ogDescription: `${companyName} helps buyers source used CNC, conventional, and heavy industrial machines with photos, specifications, and enquiry support.`,
  }),
  makePage({
    id: "seo-about",
    label: "About Us",
    route: "/about",
    title: `About ${companyName}`,
    description: `Learn about ${companyName}, an industrial machinery sourcing company helping buyers find used CNC, metal working, workshop, and plant equipment.`,
    keywords: uniqueKeywords([
      `about ${companyName}`,
      "industrial machinery company",
      "used machinery sourcing",
      "machine dealer India",
    ]),
    canonicalUrl: "/about",
    ogTitle: `About ${companyName}`,
    ogDescription: `Know ${companyName}'s machinery trading experience, sourcing support, and industrial equipment focus.`,
  }),
  makePage({
    id: "seo-categories",
    label: "Machine Categories",
    route: "/categories",
    title: "Industrial Machine Categories",
    description: `Browse used machinery categories at ${companyName}, including CNC machines, gear machinery, boring mills, lathes, grinders, presses, and sheet metal equipment.`,
    keywords: uniqueKeywords([
      "machine categories",
      "used machine categories",
      "industrial machinery catalogue",
      "CNC machine categories",
      companyName,
    ]),
    canonicalUrl: "/categories",
    ogTitle: `Machine Categories | ${companyName}`,
    ogDescription: `Explore industrial machinery categories and find the right machine type for your requirement.`,
  }),
  makePage({
    id: "seo-contact",
    label: "Contact Us",
    route: "/contact",
    title: `Contact ${companyName}`,
    description: `Contact ${companyName} for used machine enquiries, quotations, inspection support, availability checks, and help sourcing industrial machinery.`,
    keywords: uniqueKeywords([
      `contact ${companyName}`,
      "used machinery enquiry",
      "industrial machine quotation",
      "buy used machine India",
    ]),
    canonicalUrl: "/contact",
    ogTitle: `Contact ${companyName}`,
    ogDescription: `Send your machine requirement to ${companyName} for availability, pricing, and technical guidance.`,
  }),
  makePage({
    id: "seo-used",
    label: "Used Machinery",
    route: "/used-machinery",
    title: "Used Machinery for Sale",
    description: `Explore used machinery for sale at ${companyName}, including CNC lathes, VTLs, boring mills, machining centres, gear machinery, presses, grinders, and more.`,
    keywords: uniqueKeywords([
      "used machinery for sale",
      "used CNC machines",
      "second hand industrial machines",
      "used metal working machinery",
      companyName,
    ]),
    canonicalUrl: "/used-machinery",
    ogTitle: `Used Machinery for Sale | ${companyName}`,
    ogDescription: `Browse available used industrial machinery with photos, technical details, and direct enquiry support.`,
  }),
  makePage({
    id: "seo-metal-working",
    label: "Metal Working Machinery",
    route: "/metal-working-machinery",
    title: "Metal Working Machinery",
    description: `Find used metal working machinery including CNC machines, VTLs, lathes, milling machines, boring mills, gear machinery, grinders, presses, and sheet metal machines.`,
    keywords: uniqueKeywords([
      "metal working machinery",
      "used metalworking machines",
      "CNC metal machines",
      "industrial metal machines",
      companyName,
    ]),
    canonicalUrl: "/metal-working-machinery",
    ogTitle: `Metal Working Machinery | ${companyName}`,
    ogDescription: `Explore used metal working machinery listings with specifications and enquiry support.`,
  }),
  makePage({
    id: "seo-textile",
    label: "Textile Machinery",
    route: "/textile-machinery",
    title: "Textile Machinery",
    description: `Explore textile machinery sourcing support from ${companyName}, with help finding used industrial textile machines and related production equipment.`,
    keywords: uniqueKeywords([
      "textile machinery",
      "used textile machines",
      "industrial textile equipment",
      companyName,
    ]),
    canonicalUrl: "/textile-machinery",
    ogTitle: `Textile Machinery | ${companyName}`,
    ogDescription: `Send textile machinery requirements and get sourcing assistance from ${companyName}.`,
  }),
  makePage({
    id: "seo-plastic",
    label: "Plastic Machinery",
    route: "/plastic-machinery",
    title: "Plastic Machinery",
    description: `Discover plastic machinery sourcing support from ${companyName}, including used plastic processing machines, production equipment, and plant machinery.`,
    keywords: uniqueKeywords([
      "plastic machinery",
      "used plastic machinery",
      "plastic processing machines",
      companyName,
    ]),
    canonicalUrl: "/plastic-machinery",
    ogTitle: `Plastic Machinery | ${companyName}`,
    ogDescription: `Find used plastic machinery and request sourcing support from ${companyName}.`,
  }),
  makePage({
    id: "seo-pharma",
    label: "Pharmaceutical Machinery",
    route: "/pharmaceutical-machinery",
    title: "Pharmaceutical Machinery",
    description: `Explore pharmaceutical machinery sourcing support from ${companyName}, including used pharma equipment, process machines, and industrial plant machinery.`,
    keywords: uniqueKeywords([
      "pharmaceutical machinery",
      "used pharma machines",
      "pharma equipment",
      companyName,
    ]),
    canonicalUrl: "/pharmaceutical-machinery",
    ogTitle: `Pharmaceutical Machinery | ${companyName}`,
    ogDescription: `Request pharmaceutical machinery sourcing support and availability checks from ${companyName}.`,
  }),
];

const categoryPages = topCategories.map((category) => {
  const children = (categoriesByParent.get(category.id) || []).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const machineCount = countMachinesForCategory(category, machines, categoriesByParent);
  const route = buildRoute("/used-machinery", { category: category.slug });
  const childText = children.length
    ? ` including ${children.slice(0, 4).map((item) => lower(item.name)).join(", ")}`
    : "";

  return makePage({
    id: `seo-category-${category.slug}`,
    label: category.name,
    route,
    title: `${category.name} for Sale`,
    description: compactSentence(
      `Browse ${lower(category.name)} for sale at ${companyName}. Compare ${machineCount || "available"} used machine listings${childText}, photos, specifications, and enquiry support.`,
    ),
    keywords: uniqueKeywords([
      category.name,
      `${category.name} for sale`,
      `used ${lower(category.name)}`,
      `${lower(category.name)} India`,
      companyName,
    ]),
    canonicalUrl: route,
    ogTitle: `${category.name} | ${companyName}`,
    ogDescription: compactSentence(
      `Explore ${lower(category.name)} listings at ${companyName}${childText}.`,
      140,
    ),
  });
});

const subcategoryPages = categories
  .filter((category) => category.parentId)
  .sort((left, right) => left.name.localeCompare(right.name))
  .map((subcategory) => {
    const parent = categoryById.get(subcategory.parentId);
    const machineCount = machines.filter((machine) => machine.categoryId === subcategory.id).length;
    const route = buildRoute("/used-machinery", {
      category: parent ? parent.slug : undefined,
      subcategory: subcategory.slug,
    });

    return makePage({
      id: `seo-subcategory-${parent ? parent.slug : "category"}-${subcategory.slug}`,
      label: subcategory.name,
      route,
      title: `${subcategory.name} for Sale`,
      description: compactSentence(
        `Find ${lower(subcategory.name)} for sale at ${companyName}. Review ${machineCount || "available"} used machine listings, technical details, photos, and enquiry support.`,
      ),
      keywords: uniqueKeywords([
        subcategory.name,
        `${subcategory.name} for sale`,
        `used ${lower(subcategory.name)}`,
        parent ? parent.name : "",
        companyName,
      ]),
      canonicalUrl: route,
      ogTitle: `${subcategory.name} | ${companyName}`,
      ogDescription: compactSentence(
        `${machineCount || "Available"} ${lower(subcategory.name)} listings under ${parent ? lower(parent.name) : "industrial machinery"} at ${companyName}.`,
        140,
      ),
    });
  });

const machinePages = machines.map((machine) => {
  const category = categoryById.get(machine.categoryId);
  const { mainCategory, subcategory } = getCategoryContext(category, categoryById);
  const categoryLabel = (subcategory && subcategory.name) || (mainCategory && mainCategory.name) || "industrial machinery";
  const typeLabel = machine.machineType === "cnc" ? "CNC" : "conventional";
  const brandModel = [machine.brand, machine.model].filter(Boolean).join(" ");
  const listingName = brandModel || machine.name;
  const specHighlights = Object.entries(machine.specifications || {})
    .filter(([, value]) => String(value || "").trim())
    .slice(0, 3)
    .map(([key, value]) => `${key.replace(/[_-]+/g, " ")} ${value}`)
    .join(", ");
  const detail = specHighlights
    ? ` Highlights include ${specHighlights}.`
    : machine.description
      ? ` ${machine.description}`
      : "";
  const route = buildRoute("/used-machinery", { machine: machine.id });

  return makePage({
    id: `seo-machine-${machine.id}`,
    label: machine.name,
    route,
    title: `${machine.name} for Sale`,
    description: compactSentence(
      `${machine.name} for sale at ${companyName}. Used ${typeLabel} ${lower(categoryLabel)} listing with ${machine.condition} condition, photos, enquiry support, and inspection assistance.${detail}`,
    ),
    keywords: uniqueKeywords([
      machine.name,
      `${machine.name} for sale`,
      brandModel,
      machine.brand,
      machine.model,
      `used ${lower(categoryLabel)}`,
      `${lower(typeLabel)} machine`,
      machine.inventoryNumber,
      companyName,
    ]),
    canonicalUrl: route,
    ogTitle: `${listingName} | ${companyName}`,
    ogDescription: compactSentence(
      `View ${machine.name}, a used ${typeLabel} ${lower(categoryLabel)} listing from ${companyName}.`,
      140,
    ),
    ogImageUrl: (machine.images || [])[0] || "",
  });
});

const generatedPages = [...corePages, ...categoryPages, ...subcategoryPages, ...machinePages];
const generatedIds = new Set(generatedPages.map((page) => page.id));
const customPages = (currentSeo.pages || []).filter((page) => !generatedIds.has(page.id));

const nextSeo = {
  globalTitleSuffix: currentSeo.globalTitleSuffix || " | Novatech Machinery",
  defaultTitle: "Used Industrial Machinery and CNC Machines",
  defaultDescription: `${companyName} supplies used industrial machinery, CNC machines, metal working equipment, and sourcing support for buyers across India.`,
  analytics: {
    googleAnalyticsId: currentSeo.analytics?.googleAnalyticsId || "",
    metaPixelId: currentSeo.analytics?.metaPixelId || "",
    clarityProjectId: currentSeo.analytics?.clarityProjectId || "",
  },
  pages: [...generatedPages, ...customPages],
};

fs.writeFileSync(seoPath, `${JSON.stringify(nextSeo, null, 2)}\n`, "utf8");

console.log(
  `Generated ${nextSeo.pages.length} SEO pages (${corePages.length} core, ${categoryPages.length} categories, ${subcategoryPages.length} subcategories, ${machinePages.length} machines).`,
);

if (process.argv.includes("--sync")) {
  await syncSeoSettings(nextSeo);
  console.log("Synced generated SEO settings to Supabase seo_settings/main.");
}
 







