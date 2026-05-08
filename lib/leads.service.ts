import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContactFormValues } from "@/lib/contactForm";
import { resolveProjectPath } from "@/lib/project-paths";
import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase";

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

const leadsFilePath = resolveProjectPath("data", "admin-leads.json");

function createId() {
  return `lead_${Math.random().toString(36).slice(2, 10)}`;
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
  await ensureLeadsDir();
  await writeFile(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");
}

function buildLeadRecord(values: ContactFormValues): LeadRecord {
  return {
    id: createId(),
    name: [values.firstName, values.lastName].filter(Boolean).join(" "),
    email: values.email,
    phone: values.phone,
    machineInterested: values.machineInterest,
    message: values.message,
    source: "website",
    createdAt: new Date().toISOString(),
  };
}

function leadDeletePath(record: LeadRecord) {
  const params = new URLSearchParams({
    email: `eq.${record.email}`,
    phone: `eq.${record.phone}`,
    machine_interested: `eq.${record.machineInterested}`,
    lead_source: `eq.${record.source}`,
  });

  return `leads?${params.toString()}`;
}

async function deleteLeadFromSupabase(record: LeadRecord) {
  if (!hasSupabaseConfig()) {
    return;
  }

  try {
    await supabaseRest(leadDeletePath(record), {
      method: "DELETE",
      headers: {
        Prefer: "return=minimal",
      },
    });
  } catch (error) {
    console.error("Supabase lead delete sync failed. Local lead was deleted.", error);
  }
}

export async function saveLeadRecord(values: ContactFormValues) {
  const record = buildLeadRecord(values);
  const leads = await readLeadsFile();
  await writeLeadsFile([record, ...leads]);

  if (hasSupabaseConfig()) {
    try {
      await supabaseRest("leads", {
        method: "POST",
        headers: {
          Prefer: "return=minimal",
        },
        body: JSON.stringify([
          {
            name: record.name,
            email: record.email,
            phone: record.phone,
            machine_interested: record.machineInterested,
            message: record.message,
            lead_source: record.source,
          },
        ]),
      });
    } catch (error) {
      console.error("Supabase lead sync failed, local lead was still saved.", error);
    }
  }

  return record;
}

export async function getLeadRecords() {
  const leads = await readLeadsFile();
  return [...leads].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function deleteLeadRecord(id: string) {
  const leads = await readLeadsFile();
  const targetLead = leads.find((lead) => lead.id === id);

  if (!targetLead) {
    throw new Error("Lead was not found.");
  }

  await writeLeadsFile(leads.filter((lead) => lead.id !== id));
  await deleteLeadFromSupabase(targetLead);

  return targetLead;
}

export async function replaceLeadRecords(leads: LeadRecord[]) {
  await writeLeadsFile(leads);
  return getLeadRecords();
}
