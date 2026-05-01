import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContactFormValues } from "@/lib/contactForm";
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

const leadsFilePath = path.join(process.cwd(), "data", "admin-leads.json");

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
