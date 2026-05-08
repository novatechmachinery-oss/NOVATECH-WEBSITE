import { NextResponse } from "next/server";

import { getAdminCatalog, saveAdminCatalog } from "@/lib/admin-catalog.service";
import { getLeadRecords, replaceLeadRecords } from "@/lib/leads.service";
import { getSeoSettings, saveSeoSettings } from "@/lib/seo-settings.service";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings.service";

type SystemTransferPayload = {
  catalog: Awaited<ReturnType<typeof getAdminCatalog>>;
  siteSettings: Awaited<ReturnType<typeof getSiteSettings>>;
  seoSettings: Awaited<ReturnType<typeof getSeoSettings>>;
  leads: Awaited<ReturnType<typeof replaceLeadRecords>>;
};

export async function GET() {
  const [catalog, siteSettings, seoSettings, leads] = await Promise.all([
    getAdminCatalog(),
    getSiteSettings(),
    getSeoSettings(),
    getLeadRecords(),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    catalog,
    siteSettings,
    seoSettings,
    leads,
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<SystemTransferPayload>;

    if (!payload.catalog || !payload.siteSettings || !payload.seoSettings || !Array.isArray(payload.leads)) {
      return NextResponse.json(
        { error: "Import file is invalid. Required data blocks are missing." },
        { status: 400 },
      );
    }

    await Promise.all([
      saveAdminCatalog(payload.catalog),
      saveSiteSettings(payload.siteSettings),
      saveSeoSettings(payload.seoSettings),
      replaceLeadRecords(payload.leads),
    ]);

    return NextResponse.json({ message: "Admin data imported successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to import admin data." },
      { status: 400 },
    );
  }
}
