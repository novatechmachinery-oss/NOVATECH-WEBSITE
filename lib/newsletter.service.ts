import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { NewsletterFormValues, NewsletterSubscriber } from "@/lib/newsletter.types";
import { isReadOnlyFilesystem, resolveProjectPath } from "@/lib/project-paths";
import { hasSupabaseConfig, supabaseRestAdmin } from "@/lib/supabase";

type NewsletterSubscriberRow = {
  id: string;
  contact: string | null;
  channel: "email" | "whatsapp" | null;
  status: "active" | "inactive" | null;
  subscribed_at: string | null;
};

const newsletterFilePath = resolveProjectPath("data", "admin-newsletter.json");
const NEWSLETTER_SELECT = "id,contact,channel,status,subscribed_at";

function createId() {
  return `subscriber_${randomUUID()}`;
}

function mapSubscriberRow(row: NewsletterSubscriberRow): NewsletterSubscriber {
  return {
    id: row.id,
    contact: row.contact ?? "",
    channel: row.channel === "whatsapp" ? "whatsapp" : "email",
    status: row.status === "inactive" ? "inactive" : "active",
    subscribedAt: row.subscribed_at ?? new Date().toISOString(),
  };
}

function toSubscriberInsert(subscriber: NewsletterSubscriber) {
  return {
    contact: subscriber.contact,
    channel: subscriber.channel,
    status: subscriber.status,
    subscribed_at: subscriber.subscribedAt,
  };
}

function normalizeSubscriberRecord(value: unknown): NewsletterSubscriber | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Partial<Record<keyof NewsletterSubscriber, unknown>>;
  const contact = typeof record.contact === "string" ? record.contact.trim() : "";

  if (!contact) {
    return null;
  }

  return {
    id: typeof record.id === "string" && record.id.trim() ? record.id : createId(),
    contact,
    channel: record.channel === "whatsapp" ? "whatsapp" : "email",
    status: record.status === "inactive" ? "inactive" : "active",
    subscribedAt:
      typeof record.subscribedAt === "string" && !Number.isNaN(new Date(record.subscribedAt).getTime())
        ? record.subscribedAt
        : new Date().toISOString(),
  };
}

async function ensureNewsletterDir() {
  await mkdir(path.dirname(newsletterFilePath), { recursive: true });
}

async function readNewsletterFile() {
  try {
    const content = await readFile(newsletterFilePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? parsed.flatMap((item) => normalizeSubscriberRecord(item) ?? []) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [] as NewsletterSubscriber[];
    }
    throw error;
  }
}

async function writeNewsletterFile(subscribers: NewsletterSubscriber[]) {
  if (isReadOnlyFilesystem()) {
    console.warn("Skipping local newsletter file write on read-only filesystem (Vercel).");
    return;
  }
  await ensureNewsletterDir();
  await writeFile(newsletterFilePath, JSON.stringify(subscribers, null, 2), "utf8");
}

function buildSubscriberRecord(values: NewsletterFormValues): NewsletterSubscriber {
  return {
    id: createId(),
    contact: values.contact,
    channel: values.channel,
    status: "active",
    subscribedAt: new Date().toISOString(),
  };
}

export async function getAllSubscribers() {
  if (!hasSupabaseConfig()) {
    return readNewsletterFile();
  }

  const rows = await supabaseRestAdmin<NewsletterSubscriberRow[]>(
    `newsletter_subscribers?select=${NEWSLETTER_SELECT}&order=subscribed_at.desc`,
  );

  return rows.map(mapSubscriberRow);
}

export async function saveSubscriberRecord(values: NewsletterFormValues) {
  const newSubscriber = buildSubscriberRecord(values);

  if (!hasSupabaseConfig()) {
    const subscribers = await readNewsletterFile();
    subscribers.push(newSubscriber);
    await writeNewsletterFile(subscribers);
    return newSubscriber;
  }

  const rows = await supabaseRestAdmin<NewsletterSubscriberRow[]>(
    `newsletter_subscribers?on_conflict=contact,channel&select=${NEWSLETTER_SELECT}`,
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([toSubscriberInsert(newSubscriber)]),
    },
  );

  return rows[0] ? mapSubscriberRow(rows[0]) : newSubscriber;
}

export async function updateSubscriberStatus(subscriberId: string, status: "active" | "inactive") {
  if (!hasSupabaseConfig()) {
    const subscribers = await readNewsletterFile();
    const index = subscribers.findIndex((subscriber) => subscriber.id === subscriberId);
    if (index !== -1) {
      subscribers[index].status = status;
      await writeNewsletterFile(subscribers);
      return subscribers[index];
    }
    return null;
  }

  const rows = await supabaseRestAdmin<NewsletterSubscriberRow[]>(
    `newsletter_subscribers?id=eq.${encodeURIComponent(subscriberId)}&select=${NEWSLETTER_SELECT}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
    },
  );

  return rows[0] ? mapSubscriberRow(rows[0]) : null;
}

export async function deleteSubscriber(subscriberId: string) {
  if (!hasSupabaseConfig()) {
    const subscribers = await readNewsletterFile();
    const filtered = subscribers.filter((subscriber) => subscriber.id !== subscriberId);
    await writeNewsletterFile(filtered);
    return;
  }

  await supabaseRestAdmin(`newsletter_subscribers?id=eq.${encodeURIComponent(subscriberId)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}
