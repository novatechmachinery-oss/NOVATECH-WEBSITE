import type {
  Lead,
  LeadStage,
  Machine,
  MachineFormValues,
  MachineSpecification,
  UserRecord,
} from "@/types/machine";
import type {
  SeoGlobalSettings,
  SeoMachineTemplate,
  SeoPageRecord,
  SeoWorkspace,
} from "@/types/seo";
import type { AdminSettings, TrackingSettings, WorkspaceSnapshot } from "@/types/settings";

const MACHINE_STORAGE_KEY = "novatech-admin-machines";
const SETTINGS_STORAGE_KEY = "novatech-admin-settings";
const CATEGORY_STORAGE_KEY = "novatech-admin-categories";
const SUBCATEGORY_STORAGE_KEY = "novatech-admin-subcategories";
const SETTINGS_CHANGE_EVENT = "novatech:settings-change";
const SEO_STORAGE_KEY = "novatech-admin-seo";
const SEO_CHANGE_EVENT = "novatech:seo-change";

const defaultCategories = [
  "Metal Working Machinery",
  "Plastic Machinery",
  "Textile Machinery",
  "Pharmaceutical Machinery",
];

const defaultSubcategoryMap: Record<string, string[]> = {
  "Metal Working Machinery": [
    "Heavy Duty Lathes",
    "Gear Hobbers",
    "Bending Machines",
    "Horizontal Machining Centres",
    "Turning and Milling Centres",
  ],
  "Plastic Machinery": ["Injection Moulding", "Blow Moulding", "Extrusion Lines"],
  "Textile Machinery": ["Weaving Machines", "Knitting Machines", "Dyeing Units"],
  "Pharmaceutical Machinery": ["Tablet Press", "Capsule Fillers", "Packaging Lines"],
};

const defaultSettings: AdminSettings = {
  profile: {
    fullName: "Admin Novatech Machinery",
    phone: "+91 9646255855",
    email: "admin@novatechmachinery.com",
  },
  smtp: {
    host: "smtp.gmail.com",
    port: "587",
    username: "admin@novatechmachinery.com",
    password: "novatech-app-password",
    fromEmail: "info@novatechmachinery.com",
    fromName: "Novatech Machinery",
    useSsl: false,
  },
  tracking: {
    googleAnalyticsId: "G-P6982NCZTC",
    metaPixelId: "1254549116261073",
    microsoftClarityId: "w8fhp8peo",
  },
  security: {
    passwordHash: "",
    passwordUpdatedAt: null,
  },
};

const defaultSeoGlobalSettings: SeoGlobalSettings = {
  siteName: "Novatech Machinery",
  siteUrl: "https://novatechmachinery.com",
  titleSuffix: "| Novatech Machinery",
  defaultMetaDescription:
    "Used industrial machinery, CNC systems, fabrication equipment and production lines sourced by Novatech Machinery.",
  defaultKeywords:
    "used machinery, industrial machines, cnc machines, novatech machinery, machine dealers",
  defaultOgImage: "/images/seo/novatech-default-og.jpg",
  twitterHandle: "@novatechmachinery",
};

const defaultSeoMachineTemplate: SeoMachineTemplate = {
  machineTitleTemplate: "{machineName} {brand} {model} {titleSuffix}",
  machineDescriptionTemplate:
    "Explore {machineName} from {brand}. Category: {category}. Condition: {condition}. Source premium used machinery with Novatech Machinery.",
  categoryTitleTemplate: "{categoryName} Machines {titleSuffix}",
  categoryDescriptionTemplate:
    "Browse {categoryName} machines curated by Novatech Machinery for production-ready industrial requirements.",
};

const defaultAdminSettingsSnapshot = normalizeSettings(defaultSettings);
let cachedAdminSettingsSnapshot = defaultAdminSettingsSnapshot;
let cachedAdminSettingsRaw: string | null = null;

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSeoId(source: SeoPageRecord["source"], path: string) {
  return `${source}:${path || "/"}`;
}

function formatTitleWithSuffix(title: string) {
  return `${title} ${defaultSeoGlobalSettings.titleSuffix}`.trim();
}

function createSeoPageRecord(
  source: SeoPageRecord["source"],
  path: string,
  pageTitle: string,
  options?: Partial<SeoPageRecord>,
): SeoPageRecord {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const metaTitle = options?.metaTitle ?? formatTitleWithSuffix(pageTitle);
  const metaDescription =
    options?.metaDescription ??
    `${pageTitle} page on Novatech Machinery with focused metadata for search visibility and catalogue discovery.`;

  return {
    id: options?.id ?? buildSeoId(source, normalizedPath),
    path: normalizedPath,
    pageTitle,
    metaTitle,
    metaDescription,
    keywords: options?.keywords ?? "",
    canonicalUrl: options?.canonicalUrl ?? normalizedPath,
    ogTitle: options?.ogTitle ?? metaTitle,
    ogDescription: options?.ogDescription ?? metaDescription,
    noIndex: options?.noIndex ?? false,
    noFollow: options?.noFollow ?? false,
    source,
    lockedPath: options?.lockedPath ?? source !== "custom",
    updatedAt: options?.updatedAt ?? null,
  };
}

const dummyMachines: Machine[] = [
  {
    id: "MCH-1001",
    name: "Heavy Duty CNC Slant Bed Lathe",
    brand: "Doosan",
    model: "Puma GT 2600",
    serialNumber: "SN-88342",
    countryOfOrigin: "South Korea",
    price: 92000,
    category: "Metal Working Machinery",
    subcategory: "Heavy Duty Lathes",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Rigid slant bed lathe for high accuracy turning in medium and heavy production.",
    specifications: [
      { key: "Swing", value: "660 mm" },
      { key: "Chuck", value: "10 inch" },
      { key: "Control", value: "Fanuc i Series" },
    ],
    images: ["https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7"],
  },
  {
    id: "MCH-1002",
    name: "CNC Gear Hobber",
    brand: "Pfauter",
    model: "PE 160",
    serialNumber: "SN-20455",
    countryOfOrigin: "Germany",
    price: 68000,
    category: "Metal Working Machinery",
    subcategory: "Gear Hobbers",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "Conventional",
    description: "Gear hobbing machine for repeatable cutting quality and production-grade reliability.",
    specifications: [
      { key: "Max Diameter", value: "160 mm" },
      { key: "Module", value: "6" },
      { key: "Voltage", value: "415V" },
    ],
    images: ["https://images.unsplash.com/photo-1581092918484-8313f4e2dd4e"],
  },
  {
    id: "MCH-1003",
    name: "UPETROM Heavy-Duty CNC Lathe",
    brand: "UPETROM",
    model: "UHD 40",
    serialNumber: "SN-45990",
    countryOfOrigin: "Romania",
    price: 78000,
    category: "Metal Working Machinery",
    subcategory: "Heavy Duty Lathes",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Heavy-duty turning solution built for large shaft and cylindrical components.",
    specifications: [
      { key: "Bed Length", value: "4000 mm" },
      { key: "Power", value: "22 kW" },
      { key: "Max Turning Dia", value: "800 mm" },
    ],
    images: ["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b"],
  },
  {
    id: "MCH-1004",
    name: "4 Rolls Hydraulic Plate Bender",
    brand: "Faccin",
    model: "4HEL 1264",
    serialNumber: "SN-77122",
    countryOfOrigin: "Italy",
    price: 126000,
    category: "Metal Working Machinery",
    subcategory: "Bending Machines",
    condition: "Used",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Four-roll plate rolling machine for precise bending in fabrication lines.",
    specifications: [
      { key: "Rolling Width", value: "3100 mm" },
      { key: "Thickness", value: "25 mm" },
      { key: "Hydraulic", value: "Yes" },
    ],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
  },
  {
    id: "MCH-1005",
    name: "Horizontal Machining Centre",
    brand: "Doosan",
    model: "HM 500",
    serialNumber: "SN-12001",
    countryOfOrigin: "South Korea",
    price: 112000,
    category: "Metal Working Machinery",
    subcategory: "Horizontal Machining Centres",
    condition: "Used",
    stockStatus: "Limited",
    machineType: "CNC",
    description: "Horizontal machining centre suited for continuous multi-face machining operations.",
    specifications: [
      { key: "Pallet Size", value: "500 x 500" },
      { key: "Tool Capacity", value: "60" },
      { key: "Spindle", value: "12000 rpm" },
    ],
    images: ["https://images.unsplash.com/photo-1517048676732-d65bc937f952"],
  },
  {
    id: "MCH-1006",
    name: "CNC Turning and Milling Center",
    brand: "DMG Gildemeister",
    model: "CTX Beta 1250",
    serialNumber: "SN-45003",
    countryOfOrigin: "Germany",
    price: 143000,
    category: "Metal Working Machinery",
    subcategory: "Turning and Milling Centres",
    condition: "Refurbished",
    stockStatus: "In Stock",
    machineType: "CNC",
    description: "Combined turning and milling center for complex part production with reduced setups.",
    specifications: [
      { key: "Axis", value: "5 Axis" },
      { key: "Chuck", value: "12 inch" },
      { key: "Controller", value: "Siemens" },
    ],
    images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72"],
  },
];

const dummyLeads: Lead[] = [
  {
    id: "LEAD-1",
    name: "Manjunatha",
    company: "Manjunatha Swamy Engineering Services",
    interestedIn: "Gear Hobber WMW Modul ZFWZ 1250/1500",
    stage: "New",
  },
  {
    id: "LEAD-2",
    name: "Gurdev Singh",
    company: "RC Engineering",
    interestedIn: "GEAR HOBBER WMW MODUL ZFWZ 6300",
    stage: "New",
  },
  {
    id: "LEAD-3",
    name: "Adeel Khan",
    company: "Khan Fabrication Works",
    interestedIn: "4 Rolls Hydraulic Plate Bender",
    stage: "Contacted",
  },
];

const dummyUsers: UserRecord[] = [
  {
    id: "USR-1",
    name: "Admin Novatech Machinery",
    phone: "+91 9646255855",
    role: "Super Admin",
    joined: "2026-04-06",
  },
  {
    id: "USR-2",
    name: "Sales Manager",
    phone: "+91 9090909090",
    role: "Sales",
    joined: "2026-04-11",
  },
];

function buildDefaultSeoPages() {
  const systemPages = [
    createSeoPageRecord("system", "/", "Home", {
      metaDescription:
        "Used industrial machinery marketplace by Novatech Machinery featuring CNC, fabrication and production equipment.",
      keywords: "novatech machinery, used industrial machinery, cnc machines",
    }),
    createSeoPageRecord("system", "/about", "About Us", {
      metaDescription:
        "Learn about Novatech Machinery, our sourcing network and expertise in industrial machine trading.",
    }),
    createSeoPageRecord("system", "/categories", "Machine Categories", {
      metaDescription:
        "Browse machine categories, production equipment groups and industrial segments offered by Novatech Machinery.",
    }),
    createSeoPageRecord("system", "/contact", "Contact Us", {
      metaDescription:
        "Contact Novatech Machinery for machine sourcing, pricing, inventory support and industrial equipment assistance.",
    }),
    createSeoPageRecord("system", "/machines", "All Machines", {
      metaDescription:
        "Explore all listed machines including CNC, fabrication, forming and production equipment available with Novatech Machinery.",
    }),
  ];

  const categoryPages = getCategoryOptions().map((category) =>
    createSeoPageRecord(
      "category",
      `/machines/category/${slugifySegment(category)}`,
      category,
      {
        metaTitle: formatTitleWithSuffix(`${category} Machines`),
        metaDescription:
          defaultSeoMachineTemplate.categoryDescriptionTemplate.replace("{categoryName}", category),
      },
    ),
  );

  const machinePages = getMachines().map((machine) =>
    createSeoPageRecord("machine", `/machines/${slugifySegment(machine.name)}`, machine.name, {
      metaTitle: defaultSeoMachineTemplate.machineTitleTemplate
        .replace("{machineName}", machine.name)
        .replace("{brand}", machine.brand)
        .replace("{model}", machine.model)
        .replace("{titleSuffix}", defaultSeoGlobalSettings.titleSuffix),
      metaDescription: defaultSeoMachineTemplate.machineDescriptionTemplate
        .replace("{machineName}", machine.name)
        .replace("{brand}", machine.brand)
        .replace("{category}", machine.category)
        .replace("{condition}", machine.condition),
      keywords: [machine.category, machine.subcategory, machine.brand, machine.model]
        .filter(Boolean)
        .join(", "),
    }),
  );

  return [...systemPages, ...categoryPages, ...machinePages];
}

function normalizeSeoWorkspace(value?: Partial<SeoWorkspace>): SeoWorkspace {
  const defaultPages = buildDefaultSeoPages();
  const storedPages = Array.isArray(value?.pages) ? value.pages : [];
  const storedById = new Map(storedPages.map((page) => [page.id, page]));
  const defaultIds = new Set(defaultPages.map((page) => page.id));

  const mergedDefaultPages = defaultPages.map((page) => {
    const storedPage = storedById.get(page.id);

    if (!storedPage) {
      return page;
    }

    return {
      ...page,
      ...storedPage,
      id: page.id,
      path: page.path,
      source: page.source,
      lockedPath: page.lockedPath,
    };
  });

  const customPages = storedPages
    .filter((page) => page.source === "custom" && !defaultIds.has(page.id))
    .map((page) => ({
      ...createSeoPageRecord("custom", page.path, page.pageTitle),
      ...page,
      id: page.id || buildSeoId("custom", page.path),
      source: "custom" as const,
      lockedPath: false,
    }));

  return {
    pages: [...mergedDefaultPages, ...customPages],
    global: {
      ...defaultSeoGlobalSettings,
      ...(value?.global ?? {}),
    },
    machineTemplate: {
      ...defaultSeoMachineTemplate,
      ...(value?.machineTemplate ?? {}),
    },
  };
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T) {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  return value;
}

function normalizeSettings(value?: Partial<AdminSettings>): AdminSettings {
  return {
    profile: {
      ...defaultSettings.profile,
      ...(value?.profile ?? {}),
    },
    smtp: {
      ...defaultSettings.smtp,
      ...(value?.smtp ?? {}),
    },
    tracking: {
      ...defaultSettings.tracking,
      ...(value?.tracking ?? {}),
    },
    security: {
      ...defaultSettings.security,
      ...(value?.security ?? {}),
    },
  };
}

const defaultSeoWorkspaceSnapshot = normalizeSeoWorkspace();
let cachedSeoWorkspaceSnapshot = defaultSeoWorkspaceSnapshot;
let cachedSeoWorkspaceRaw: string | null = null;

function cacheAdminSettingsSnapshot(settings: AdminSettings) {
  cachedAdminSettingsSnapshot = settings;
  cachedAdminSettingsRaw = JSON.stringify(settings);
  return settings;
}

function cacheSeoWorkspaceSnapshot(workspace: SeoWorkspace) {
  cachedSeoWorkspaceSnapshot = workspace;
  cachedSeoWorkspaceRaw = JSON.stringify(workspace);
  return workspace;
}

function readAdminSettingsSnapshot() {
  if (!canUseStorage()) {
    return defaultAdminSettingsSnapshot;
  }

  const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!raw) {
    cachedAdminSettingsRaw = null;
    cachedAdminSettingsSnapshot = defaultAdminSettingsSnapshot;
    return cachedAdminSettingsSnapshot;
  }

  if (raw === cachedAdminSettingsRaw) {
    return cachedAdminSettingsSnapshot;
  }

  try {
    return cacheAdminSettingsSnapshot(normalizeSettings(JSON.parse(raw) as Partial<AdminSettings>));
  } catch {
    cachedAdminSettingsRaw = null;
    cachedAdminSettingsSnapshot = defaultAdminSettingsSnapshot;
    return cachedAdminSettingsSnapshot;
  }
}

function readSeoWorkspaceSnapshot() {
  if (!canUseStorage()) {
    return defaultSeoWorkspaceSnapshot;
  }

  const raw = window.localStorage.getItem(SEO_STORAGE_KEY);

  if (!raw) {
    cachedSeoWorkspaceRaw = null;
    cachedSeoWorkspaceSnapshot = defaultSeoWorkspaceSnapshot;
    return cachedSeoWorkspaceSnapshot;
  }

  if (raw === cachedSeoWorkspaceRaw) {
    return normalizeSeoWorkspace(cachedSeoWorkspaceSnapshot);
  }

  try {
    return cacheSeoWorkspaceSnapshot(normalizeSeoWorkspace(JSON.parse(raw) as Partial<SeoWorkspace>));
  } catch {
    cachedSeoWorkspaceRaw = null;
    cachedSeoWorkspaceSnapshot = defaultSeoWorkspaceSnapshot;
    return cachedSeoWorkspaceSnapshot;
  }
}

function parseSpecifications(specificationsText: string): MachineSpecification[] {
  return specificationsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [key, ...valueParts] = item.split(":");
      return {
        key: key?.trim() || "Specification",
        value: valueParts.join(":").trim() || "-",
      };
    });
}

function parseImages(imagesText: string) {
  return imagesText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildMachine(values: MachineFormValues, id?: string): Machine {
  return {
    id: id ?? `MCH-${Math.floor(Date.now() / 10)}`,
    name: values.name,
    brand: values.brand,
    model: values.model,
    serialNumber: values.serialNumber,
    countryOfOrigin: values.countryOfOrigin,
    price: values.price,
    category: values.category,
    subcategory: values.subcategory,
    condition: values.condition,
    stockStatus: values.stockStatus,
    machineType: values.machineType,
    description: values.description,
    specifications: parseSpecifications(values.specificationsText),
    images: parseImages(values.imagesText),
  };
}

function setMachines(machines: Machine[]) {
  return writeStorage(MACHINE_STORAGE_KEY, machines);
}

function setCategoryOptions(categories: string[]) {
  return writeStorage(CATEGORY_STORAGE_KEY, categories);
}

function setSubcategoryMap(subcategoryMap: Record<string, string[]>) {
  return writeStorage(SUBCATEGORY_STORAGE_KEY, subcategoryMap);
}

function setAdminSettings(settings: Partial<AdminSettings>) {
  const normalizedSettings = cacheAdminSettingsSnapshot(normalizeSettings(settings));

  writeStorage(SETTINGS_STORAGE_KEY, normalizedSettings);

  if (canUseStorage()) {
    window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
  }

  return normalizedSettings;
}

function setSeoWorkspace(workspace: Partial<SeoWorkspace>) {
  const normalizedWorkspace = cacheSeoWorkspaceSnapshot(normalizeSeoWorkspace(workspace));

  writeStorage(SEO_STORAGE_KEY, normalizedWorkspace);

  if (canUseStorage()) {
    window.dispatchEvent(new Event(SEO_CHANGE_EVENT));
  }

  return normalizedWorkspace;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every(isStringArray);
}

async function hashSecret(secret: string) {
  const content = secret.trim();
  const encoder = new TextEncoder();
  const buffer = encoder.encode(content);

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  return Array.from(buffer)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function getMachines() {
  return readStorage(MACHINE_STORAGE_KEY, dummyMachines);
}

export function seedMachines(force = false) {
  const current = getMachines();
  if (!force && current.length > 0) {
    if (canUseStorage() && !window.localStorage.getItem(MACHINE_STORAGE_KEY)) {
      return setMachines(dummyMachines);
    }
    return current;
  }

  return setMachines(dummyMachines);
}

export function createMachine(values: MachineFormValues) {
  return setMachines([buildMachine(values), ...getMachines()]);
}

export function updateMachine(id: string, values: MachineFormValues) {
  return setMachines(
    getMachines().map((machine) => (machine.id === id ? buildMachine(values, id) : machine)),
  );
}

export function deleteMachine(id: string) {
  return setMachines(getMachines().filter((machine) => machine.id !== id));
}

export function getCategoryOptions() {
  return readStorage(CATEGORY_STORAGE_KEY, defaultCategories);
}

export function getSubcategoryMap() {
  return readStorage(SUBCATEGORY_STORAGE_KEY, defaultSubcategoryMap);
}

export function getLeads() {
  return dummyLeads;
}

export function getUsers() {
  return dummyUsers;
}

export function getAdminSettings() {
  return readAdminSettingsSnapshot();
}

export function getDefaultAdminSettings() {
  return defaultAdminSettingsSnapshot;
}

export function subscribeAdminSettings(onStoreChange: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handleChange = (event: Event) => {
    if (typeof StorageEvent !== "undefined" && event instanceof StorageEvent) {
      if (event.key && event.key !== SETTINGS_STORAGE_KEY) {
        return;
      }
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(SETTINGS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SETTINGS_CHANGE_EVENT, handleChange);
  };
}

export function getSeoWorkspace() {
  return readSeoWorkspaceSnapshot();
}

export function getDefaultSeoWorkspace() {
  return defaultSeoWorkspaceSnapshot;
}

export function subscribeSeoWorkspace(onStoreChange: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handleChange = (event: Event) => {
    if (typeof StorageEvent !== "undefined" && event instanceof StorageEvent) {
      if (event.key && event.key !== SEO_STORAGE_KEY) {
        return;
      }
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(SEO_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(SEO_CHANGE_EVENT, handleChange);
  };
}

export function createSeoPage(values: Pick<SeoPageRecord, "path" | "pageTitle">) {
  const workspace = getSeoWorkspace();
  const normalizedPath = values.path.trim().startsWith("/") ? values.path.trim() : `/${values.path.trim()}`;
  const id = buildSeoId("custom", normalizedPath);

  const nextPages = [
    createSeoPageRecord("custom", normalizedPath, values.pageTitle.trim() || "New Page", {
      id,
      updatedAt: new Date().toISOString(),
    }),
    ...workspace.pages.filter((page) => page.id !== id),
  ];

  return setSeoWorkspace({
    ...workspace,
    pages: nextPages,
  });
}

export function updateSeoPage(id: string, updates: Partial<SeoPageRecord>) {
  const workspace = getSeoWorkspace();

  return setSeoWorkspace({
    ...workspace,
    pages: workspace.pages.map((page) => {
      if (page.id !== id) {
        return page;
      }

      const nextPath = page.lockedPath ? page.path : updates.path?.trim() || page.path;

      return {
        ...page,
        ...updates,
        id: page.lockedPath ? page.id : buildSeoId(page.source, nextPath),
        path: nextPath.startsWith("/") ? nextPath : `/${nextPath}`,
        source: page.source,
        lockedPath: page.lockedPath,
        updatedAt: new Date().toISOString(),
      };
    }),
  });
}

export function deleteSeoPage(id: string) {
  const workspace = getSeoWorkspace();
  const page = workspace.pages.find((entry) => entry.id === id);

  if (!page || page.source !== "custom") {
    return workspace;
  }

  return setSeoWorkspace({
    ...workspace,
    pages: workspace.pages.filter((entry) => entry.id !== id),
  });
}

export function updateSeoGlobalSettings(global: SeoGlobalSettings) {
  return setSeoWorkspace({
    ...getSeoWorkspace(),
    global,
  });
}

export function updateSeoMachineTemplate(machineTemplate: SeoMachineTemplate) {
  return setSeoWorkspace({
    ...getSeoWorkspace(),
    machineTemplate,
  });
}

export function updateProfileSettings(profile: AdminSettings["profile"]) {
  return setAdminSettings({
    ...getAdminSettings(),
    profile,
  });
}

export function updateSmtpSettings(smtp: AdminSettings["smtp"]) {
  return setAdminSettings({
    ...getAdminSettings(),
    smtp,
  });
}

export function updateTrackingSettings(tracking: AdminSettings["tracking"]) {
  return setAdminSettings({
    ...getAdminSettings(),
    tracking,
  });
}

export function getActiveTrackingCount(tracking: TrackingSettings = getAdminSettings().tracking) {
  return Object.values(tracking).filter(Boolean).length;
}

export function sendTestEmail(recipientEmail: string) {
  const settings = getAdminSettings();
  const { smtp } = settings;
  const requiredFields = [smtp.host, smtp.port, smtp.username, smtp.password, smtp.fromEmail, smtp.fromName];

  if (requiredFields.some((value) => !value.trim())) {
    return {
      ok: false,
      message: "SMTP details complete kijiye, phir test email bhej sakte hain.",
    };
  }

  if (!isEmail(recipientEmail.trim())) {
    return {
      ok: false,
      message: "Valid recipient email enter kijiye.",
    };
  }

  return {
    ok: true,
    message: `Test email ${recipientEmail.trim()} ke liye queued hai. Delivery backend integration ke baad live SMTP par jayegi.`,
  };
}

export async function changeAdminPassword(password: string) {
  const settings = getAdminSettings();
  const passwordHash = await hashSecret(password);

  return setAdminSettings({
    ...settings,
    security: {
      passwordHash,
      passwordUpdatedAt: new Date().toISOString(),
    },
  });
}

export function buildWorkspaceSnapshot(): WorkspaceSnapshot {
  return {
    version: "novatech-admin/v1",
    exportedAt: new Date().toISOString(),
    machines: getMachines(),
    categories: getCategoryOptions(),
    subcategoryMap: getSubcategoryMap(),
    leads: getLeads(),
    users: getUsers(),
    settings: getAdminSettings(),
  };
}

export function importWorkspaceSnapshot(rawSnapshot: string) {
  const parsed = JSON.parse(rawSnapshot) as Partial<WorkspaceSnapshot>;

  let importedSomething = false;

  if (Array.isArray(parsed.machines)) {
    setMachines(parsed.machines as Machine[]);
    importedSomething = true;
  }

  if (isStringArray(parsed.categories)) {
    setCategoryOptions(parsed.categories);
    importedSomething = true;
  }

  if (isStringArrayRecord(parsed.subcategoryMap)) {
    setSubcategoryMap(parsed.subcategoryMap);
    importedSomething = true;
  }

  if (parsed.settings && typeof parsed.settings === "object") {
    setAdminSettings(parsed.settings);
    importedSomething = true;
  }

  if (!importedSomething) {
    throw new Error("Snapshot me import karne layak data nahi mila.");
  }

  return {
    machines: getMachines().length,
    categories: getCategoryOptions().length,
    subcategories: Object.values(getSubcategoryMap()).flat().length,
    trackingTools: getActiveTrackingCount(),
  };
}

export function getLeadStageCount(stage: LeadStage) {
  return dummyLeads.filter((lead) => lead.stage === stage).length;
}

export function getMachineStats() {
  const machines = getMachines();
  const categories = getCategoryOptions();
  const subcategoryMap = getSubcategoryMap();

  return {
    totalMachines: machines.length,
    availableMachines: machines.filter((machine) => machine.stockStatus === "In Stock").length,
    reservedMachines: machines.filter((machine) => machine.stockStatus === "Limited").length,
    totalLeads: dummyLeads.length,
    newToday: dummyLeads.filter((lead) => lead.stage === "New").length,
    dealsWon: dummyLeads.filter((lead) => lead.stage === "Won").length,
    totalCategories: categories.length,
    totalSubcategories: Object.values(subcategoryMap).flat().length,
  };
}

export function getLeadPipeline() {
  const stages: LeadStage[] = ["New", "Contacted", "Quotation", "Negotiation", "Won", "Lost"];
  return stages.map((stage) => ({
    stage,
    count: getLeadStageCount(stage),
  }));
}
