import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContactFormValues } from "@/lib/contactForm";
import { isReadOnlyFilesystem, resolveProjectPath } from "@/lib/project-paths";
import { hasSupabaseConfig, supabaseRestAdmin } from "@/lib/supabase";

export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  machineInterested: string;
  message: string;
  source: string;
  createdAt: string;
};

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  machine_interested: string | null;
  message: string | null;
  lead_source: string | null;
  created_at: string | null;
};

const leadsFilePath = resolveProjectPath("data", "admin-leads.json");
const LEAD_SELECT = "id,name,email,phone,machine_interested,message,lead_source,created_at";

function createId() {
  return `lead_${randomUUID()}`;
}

function mapLeadRow(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    machineInterested: row.machine_interested ?? "",
    message: row.message ?? "",
    source: row.lead_source ?? "website",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function toLeadInsert(record: LeadRecord) {
  return {
    name: record.name,
    email: record.email,
    phone: record.phone,
    machine_interested: record.machineInterested,
    message: record.message,
    lead_source: record.source,
    created_at: record.createdAt,
  };
}

async function ensureLeadsDir() {
  await mkdir(path.dirname(leadsFilePath), { recursive: true });
}

async function readLeadsFile() {
  try {
    const content = await readFile(leadsFilePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? (parsed as LeadRecord[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [] as LeadRecord[];
    }
    throw error;
  }
}

async function writeLeadsFile(leads: LeadRecord[]) {
  if (isReadOnlyFilesystem()) {
    console.warn("Skipping local leads file write on read-only filesystem (Vercel).");
    return;
  }
  await ensureLeadsDir();
  await writeFile(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");
}

function buildLeadRecord(values: ContactFormValues): LeadRecord {
  return {
    id: createId(),
    name: values.fullName,
    email: values.email,
    phone: values.phone,
    machineInterested: values.machineInterest,
    message: `Country: ${values.country}` + "\n\n" + values.message,
    source: "website",
    createdAt: new Date().toISOString(),
  };
}

export async function saveLeadRecord(values: ContactFormValues) {
  const record = buildLeadRecord(values);

  if (!hasSupabaseConfig()) {
    const leads = await readLeadsFile();
    await writeLeadsFile([record, ...leads]);
    return record;
  }

  const rows = await supabaseRestAdmin<LeadRow[]>(`leads?select=${LEAD_SELECT}`, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify([toLeadInsert(record)]),
  });

  return rows[0] ? mapLeadRow(rows[0]) : record;
}

export async function getLeadRecords() {
  if (!hasSupabaseConfig()) {
    const leads = await readLeadsFile();
    return [...leads].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  const rows = await supabaseRestAdmin<LeadRow[]>(
    `leads?select=${LEAD_SELECT}&order=created_at.desc`,
  );

  return rows.map(mapLeadRow);
}

export async function deleteLeadRecord(id: string) {
  if (!hasSupabaseConfig()) {
    const leads = await readLeadsFile();
    const targetLead = leads.find((lead) => lead.id === id);

    if (!targetLead) {
      throw new Error("Lead was not found.");
    }

    await writeLeadsFile(leads.filter((lead) => lead.id !== id));
    return targetLead;
  }

  const rows = await supabaseRestAdmin<LeadRow[]>(
    `leads?id=eq.${encodeURIComponent(id)}&select=${LEAD_SELECT}`,
    {
      method: "DELETE",
      headers: {
        Prefer: "return=representation",
      },
    },
  );

  if (!rows[0]) {
    throw new Error("Lead was not found.");
  }

  return mapLeadRow(rows[0]);
}

export async function replaceLeadRecords(leads: LeadRecord[]) {
  if (!hasSupabaseConfig()) {
    await writeLeadsFile(leads);
    return getLeadRecords();
  }

  await supabaseRestAdmin("leads?id=not.is.null", {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });

  if (leads.length) {
    await supabaseRestAdmin("leads", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify(leads.map(toLeadInsert)),
    });
  }

  return getLeadRecords();
}
