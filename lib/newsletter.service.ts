import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { NewsletterFormValues, NewsletterSubscriber } from "@/lib/newsletter.types";
import { resolveProjectPath } from "@/lib/project-paths";

const newsletterFilePath = resolveProjectPath("data", "admin-newsletter.json");

function createId() {
  return `subscriber_${Math.random().toString(36).slice(2, 10)}`;
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
  return readNewsletterFile();
}

export async function saveSubscriberRecord(values: NewsletterFormValues) {
  const subscribers = await readNewsletterFile();
  const newSubscriber = buildSubscriberRecord(values);
  subscribers.push(newSubscriber);
  await writeNewsletterFile(subscribers);
  return newSubscriber;
}

export async function updateSubscriberStatus(subscriberId: string, status: "active" | "inactive") {
  const subscribers = await readNewsletterFile();
  const index = subscribers.findIndex((s) => s.id === subscriberId);
  if (index !== -1) {
    subscribers[index].status = status;
    await writeNewsletterFile(subscribers);
    return subscribers[index];
  }
  return null;
}

export async function deleteSubscriber(subscriberId: string) {
  const subscribers = await readNewsletterFile();
  const filtered = subscribers.filter((s) => s.id !== subscriberId);
  await writeNewsletterFile(filtered);
}
