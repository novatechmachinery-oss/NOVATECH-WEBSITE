/**
 * admin-frontend/lib/api.ts
 *
 * Fetch-based API client for the admin panel.
 * All functions now call the Next.js API route handlers which talk to Supabase.
 * The function signatures are preserved to match existing page usage.
 */
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

// ============================================================
// BASE FETCH HELPER
// ============================================================
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json.data as T;
}

// ============================================================
// MACHINES
// ============================================================
export async function getMachines(filters?: {
  search?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  stockStatus?: string;
  machineType?: string;
}): Promise<Machine[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.subcategory) params.set("subcategory", filters.subcategory);
  if (filters?.condition) params.set("condition", filters.condition);
  if (filters?.stockStatus) params.set("stockStatus", filters.stockStatus);
  if (filters?.machineType) params.set("machineType", filters.machineType);
  const qs = params.toString();
  return apiFetch<Machine[]>(`/api/machines${qs ? `?${qs}` : ""}`);
}

export async function seedMachines(): Promise<Machine[]> {
  // With Supabase backend, seed is a one-time operation via /api/seed
  // This returns current machines from DB
  return getMachines();
}

export async function createMachine(values: MachineFormValues): Promise<Machine[]> {
  await apiFetch<Machine>("/api/machines", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return getMachines();
}

export async function updateMachine(id: string, values: MachineFormValues): Promise<Machine[]> {
  await apiFetch<Machine>(`/api/machines/${id}`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
  return getMachines();
}

export async function deleteMachine(id: string): Promise<Machine[]> {
  await apiFetch(`/api/machines/${id}`, { method: "DELETE" });
  return getMachines();
}

export async function getMachineStats() {
  return apiFetch<{
    totalMachines: number;
    availableMachines: number;
    reservedMachines: number;
    totalLeads: number;
    newToday: number;
    dealsWon: number;
    totalCategories: number;
    totalSubcategories: number;
  }>("/api/machines/stats");
}

// ============================================================
// CATEGORIES
// ============================================================
export async function getCategoryOptions(): Promise<string[]> {
  return apiFetch<string[]>("/api/categories?format=names");
}

export async function getSubcategoryMap(): Promise<Record<string, string[]>> {
  return apiFetch<Record<string, string[]>>("/api/categories?format=subcategory-map");
}

// ============================================================
// LEADS
// ============================================================
export async function getLeads(): Promise<Lead[]> {
  return apiFetch<Lead[]>("/api/leads");
}

export async function getLeadStageCount(stage: LeadStage): Promise<number> {
  const leads = await getLeads();
  return leads.filter((l) => l.stage === stage).length;
}

export async function getLeadPipeline() {
  return apiFetch<Array<{ stage: LeadStage; count: number }>>("/api/leads/pipeline");
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<Lead> {
  return apiFetch<Lead>(`/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify({ stage }),
  });
}

// ============================================================
// USERS
// ============================================================
export async function getUsers(): Promise<UserRecord[]> {
  return apiFetch<UserRecord[]>("/api/users");
}

// ============================================================
// SETTINGS
// ============================================================
export async function getAdminSettings(): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/settings");
}

export function getDefaultAdminSettings(): AdminSettings {
  return {
    profile: { fullName: "Admin Novatech Machinery", phone: "+91 9646255855", email: "admin@novatechmachinery.com" },
    smtp: { host: "smtp.gmail.com", port: "587", username: "admin@novatechmachinery.com", password: "", fromEmail: "info@novatechmachinery.com", fromName: "Novatech Machinery", useSsl: false },
    tracking: { googleAnalyticsId: "", metaPixelId: "", microsoftClarityId: "" },
    security: { passwordHash: "", passwordUpdatedAt: null },
  };
}

// Subscribe pattern no longer needed (no localStorage), kept for compatibility
export function subscribeAdminSettings(onStoreChange: () => void) {
  return () => undefined;
}

export async function updateProfileSettings(profile: AdminSettings["profile"]): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });
}

export async function updateSmtpSettings(smtp: AdminSettings["smtp"]): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ smtp }),
  });
}

export async function updateTrackingSettings(tracking: AdminSettings["tracking"]): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ tracking }),
  });
}

export function getActiveTrackingCount(tracking?: TrackingSettings): number {
  if (!tracking) return 0;
  return Object.values(tracking).filter(Boolean).length;
}

export async function sendTestEmail(recipientEmail: string): Promise<{ ok: boolean; message: string }> {
  return apiFetch<{ ok: boolean; message: string }>("/api/settings/test-email", {
    method: "POST",
    body: JSON.stringify({ recipientEmail }),
  });
}

export async function changeAdminPassword(password: string): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/settings/password", {
    method: "POST",
    body: JSON.stringify({ password, confirmPassword: password }),
  });
}

// ============================================================
// WORKSPACE SNAPSHOT (backup/import)
// ============================================================
export async function buildWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const res = await fetch("/api/settings/export");
  if (!res.ok) throw new Error("Export failed");
  return res.json() as Promise<WorkspaceSnapshot>;
}

export async function importWorkspaceSnapshot(rawSnapshot: string): Promise<{
  machines: number;
  categories: number;
  subcategories: number;
  trackingTools: number;
}> {
  const parsed = JSON.parse(rawSnapshot);
  const result = await apiFetch<{ message: string; machinesImported: number }>("/api/settings/import", {
    method: "POST",
    body: JSON.stringify(parsed),
  });
  return {
    machines: result.machinesImported ?? 0,
    categories: 0,
    subcategories: 0,
    trackingTools: 0,
  };
}

// ============================================================
// SEO
// ============================================================
export async function getSeoWorkspace(): Promise<SeoWorkspace> {
  const [pages, global, template] = await Promise.all([
    apiFetch<SeoPageRecord[]>("/api/seo/pages"),
    apiFetch<SeoGlobalSettings>("/api/seo/global"),
    apiFetch<SeoMachineTemplate>("/api/seo/template"),
  ]);
  return { pages, global, machineTemplate: template };
}

export function getDefaultSeoWorkspace(): SeoWorkspace {
  return {
    pages: [],
    global: {
      siteName: "Novatech Machinery",
      siteUrl: "https://novatechmachinery.com",
      titleSuffix: "| Novatech Machinery",
      defaultMetaDescription: "",
      defaultKeywords: "",
      defaultOgImage: "/images/seo/novatech-default-og.jpg",
      twitterHandle: "@novatechmachinery",
    },
    machineTemplate: {
      machineTitleTemplate: "{machineName} {brand} {model} {titleSuffix}",
      machineDescriptionTemplate: "Explore {machineName} from {brand}.",
      categoryTitleTemplate: "{categoryName} Machines {titleSuffix}",
      categoryDescriptionTemplate: "Browse {categoryName} machines curated by Novatech Machinery.",
    },
  };
}

export function subscribeSeoWorkspace(onStoreChange: () => void) {
  return () => undefined;
}

export async function createSeoPage(values: Pick<SeoPageRecord, "path" | "pageTitle">): Promise<SeoWorkspace> {
  await apiFetch("/api/seo/pages", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return getSeoWorkspace();
}

export async function updateSeoPage(id: string, updates: Partial<SeoPageRecord>): Promise<SeoWorkspace> {
  await apiFetch(`/api/seo/pages/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return getSeoWorkspace();
}

export async function deleteSeoPage(id: string): Promise<SeoWorkspace> {
  await apiFetch(`/api/seo/pages/${encodeURIComponent(id)}`, { method: "DELETE" });
  return getSeoWorkspace();
}

export async function updateSeoGlobalSettings(global: SeoGlobalSettings): Promise<void> {
  await apiFetch("/api/seo/global", {
    method: "PUT",
    body: JSON.stringify(global),
  });
}

export async function updateSeoMachineTemplate(machineTemplate: SeoMachineTemplate): Promise<void> {
  await apiFetch("/api/seo/template", {
    method: "PUT",
    body: JSON.stringify(machineTemplate),
  });
}
