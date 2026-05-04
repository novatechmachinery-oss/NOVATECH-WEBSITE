import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SiteSettings } from "@/lib/site-settings.types";
import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

const settingsFilePath = path.join(process.cwd(), "data", "site-settings.json");

const defaultSettings: SiteSettings = {
  companyName: "Novatech",
  companyTagline: "Machinery Corporation",
  adminEmail: "admin@novatechmachinery.com",
  adminProfile: {
    fullName: "Admin Novatech Machinery",
    phone: "+91 9646255855",
  },
  home: {
    heroSlides: [
      { id: "hero-1", src: "/images/hero-banner-Bt56BS_O.webp", alt: "Industrial machinery line overview" },
      { id: "hero-2", src: "/images/hero-banner-Bt56BS_O.webp", alt: "Factory metalworking production line" },
      { id: "hero-3", src: "/images/hero-banner-Bt56BS_O.webp", alt: "High-performance equipment warehouse" },
      { id: "hero-4", src: "/images/hero-banner-Bt56BS_O.webp", alt: "Premium industrial machinery sourcing" },
    ],
    featureCards: [
      {
        id: "feature-1",
        title: "All Machines",
        description: "Browse every available machine in one place",
        href: "/metal-working-machinery",
        imageSrc: "/images/all-machines-bg-pic.png",
        imagePosition: "center center",
      },
      {
        id: "feature-2",
        title: "Conventional Machines",
        description: "Lathes, milling, grinding, boring and more",
        href: "/metal-working-machinery#conventional-machines",
        imageSrc: "/images/Conventional-machines-bg-pic.png",
        imagePosition: "center center",
      },
      {
        id: "feature-3",
        title: "CNC Machines",
        description: "CNC lathes, machining centres and more",
        href: "/metal-working-machinery#cnc-machines",
        imageSrc: "/images/cnc-machines-bg-pic.png",
        imagePosition: "center center",
      },
      {
        id: "feature-4",
        title: "Sell Your Machinery",
        description: "We Buy Single Machines & Complete Plants",
        href: "/contact",
        imageSrc: "/images/sale-machines-bg-pic.png",
        imagePosition: "center center",
        ctaLabel: "Contact Us",
      },
    ],
    sectionTitle: "Special Deals",
    machineCtaTitle: "Looking for a Specific Machine?",
    machineCtaDescription: "Tell us what you need and we'll find the right machine at the best price.",
  },
  navigation: {
    categoryLinks: [
      { id: "nav-1", label: "Metal Working Machinery", href: "/metal-working-machinery" },
      { id: "nav-2", label: "Pharmaceutical Machinery", href: "/pharmaceutical-machinery" },
      { id: "nav-3", label: "Plastic Machinery", href: "/plastic-machinery" },
      { id: "nav-4", label: "Textile Machinery", href: "/textile-machinery" },
    ],
  },
  contact: {
    phonePrimary: "+91 96462 55755",
    phoneSecondary: "+91 96462 55855",
    whatsappNumber: "+91 96462 55755",
    emailAddress: "info@novatechmachinery.com",
    mapLocation: "Jubilee Walk, Sector 70, Mohali",
    officeAddress: "6th Floor, Office No. 621, Jubilee Walk, Sector 70, Mohali",
    businessHours: "Mon-Sat, 9 AM - 6 PM IST",
  },
  footer: {
    aboutText:
      "Novatech Machinery Corporation (OPC) Private Limited. Your trusted supplier of quality industrial machinery, trading in used and refurbished CNC machines, lathes, milling machines, and more.",
    quickLinks: [
      { id: "quick-1", label: "Home", href: "/" },
      { id: "quick-2", label: "Used Machinery", href: "/used-machinery" },
      { id: "quick-3", label: "Categories", href: "/categories" },
      { id: "quick-4", label: "About Us", href: "/about" },
      { id: "quick-5", label: "Contact Us", href: "/contact" },
    ],
    machineryLinks: [
      { id: "machine-1", label: "CNC Machines", href: "/metal-working-machinery#cnc-machines" },
      { id: "machine-2", label: "Horizontal Boring", href: "/metal-working-machinery" },
      { id: "machine-3", label: "Vertical Turret Lathes", href: "/metal-working-machinery" },
      { id: "machine-4", label: "Forging Presses", href: "/metal-working-machinery" },
      { id: "machine-5", label: "Grinding Machines", href: "/metal-working-machinery" },
      { id: "machine-6", label: "Gear Hobbing", href: "/metal-working-machinery" },
    ],
    copyrightText: "© 2026 All rights reserved by Novatech Digisoft.",
    policyLinks: [
      { id: "policy-1", label: "Privacy Policy", href: "/" },
      { id: "policy-2", label: "Terms of Service", href: "/" },
    ],
  },
  operations: {
    smtp: {
      host: "smtp.gmail.com",
      port: "587",
      username: "admin@novatechmachinery.com",
      password: "",
      fromEmail: "info@novatechmachinery.com",
      fromName: "Novatech Machinery",
      secure: false,
      testEmail: "test@example.com",
    },
    analytics: {
      googleAnalyticsId: "",
      metaPixelId: "",
      clarityProjectId: "",
    },
  },
};

async function ensureSettingsDir() {
  await mkdir(path.dirname(settingsFilePath), { recursive: true });
}

export async function getSiteSettings() {
  if (hasSupabaseConfig()) {
    try {
      const data = await supabaseRest<{settings: Partial<SiteSettings>}[]>("site_settings?id=eq.main&select=settings");
      if (data && data.length > 0 && data[0].settings) {
        const parsed = data[0].settings;
        return {
          ...defaultSettings,
          ...parsed,
          adminProfile: { ...defaultSettings.adminProfile, ...parsed.adminProfile },
          home: { ...defaultSettings.home, ...parsed.home },
          navigation: { ...defaultSettings.navigation, ...parsed.navigation },
          contact: { ...defaultSettings.contact, ...parsed.contact },
          footer: { ...defaultSettings.footer, ...parsed.footer },
          operations: {
            smtp: { ...defaultSettings.operations.smtp, ...parsed.operations?.smtp },
            analytics: { ...defaultSettings.operations.analytics, ...parsed.operations?.analytics },
          },
        } satisfies SiteSettings;
      }
    } catch (error) {
      console.error("Failed to fetch site settings from Supabase, falling back to local.", error);
    }
  }

  try {
    const content = await readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(content) as Partial<SiteSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      adminProfile: { ...defaultSettings.adminProfile, ...parsed.adminProfile },
      home: { ...defaultSettings.home, ...parsed.home },
      navigation: { ...defaultSettings.navigation, ...parsed.navigation },
      contact: { ...defaultSettings.contact, ...parsed.contact },
      footer: { ...defaultSettings.footer, ...parsed.footer },
      operations: {
        smtp: { ...defaultSettings.operations.smtp, ...parsed.operations?.smtp },
        analytics: { ...defaultSettings.operations.analytics, ...parsed.operations?.analytics },
      },
    } satisfies SiteSettings;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await saveSiteSettings(defaultSettings);
  return defaultSettings;
}

export async function saveSiteSettings(settings: SiteSettings) {
  try {
    await ensureSettingsDir();
    await writeFile(settingsFilePath, JSON.stringify(settings, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write site settings locally:", error);
  }

  if (hasSupabaseConfig()) {
    try {
      await supabaseRest("site_settings", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates, return=minimal" },
        body: JSON.stringify([{ id: "main", settings }]),
      });
    } catch (error) {
      console.error("Failed to sync site settings to Supabase", error);
    }
  }

  return settings;
}
