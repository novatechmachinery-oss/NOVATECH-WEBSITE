import "server-only";

import type { ContactFormValues } from "@/lib/contactForm";

const DEFAULT_CRM_ASSIGNEE = "Jagmeet";
const DEFAULT_LEAD_CATEGORY = "End User";
const DEFAULT_TIMEOUT_MS = 8000;

type CrmSyncSource = {
  id: string;
  createdAt: string;
};

function pickRuntimeValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : "";
}

function pickRuntimeNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildLocation(values: ContactFormValues) {
  return [values.country, values.companyAddress].filter(Boolean).join(" / ");
}

function buildDiscussion(values: ContactFormValues) {
  const details = [
    values.companyName ? `Company: ${values.companyName}` : "",
    values.email ? `Email: ${values.email}` : "",
  ].filter(Boolean);

  return [...details, values.message].join("\n\n");
}

function buildCrmPayload(values: ContactFormValues, source?: CrmSyncSource) {
  const assignedTo = pickRuntimeValue(process.env.CRM_ENQUIRY_ASSIGNED_TO) || DEFAULT_CRM_ASSIGNEE;

  return {
    websiteLeadId: source?.id ?? "",
    idempotencyKey: source?.id ? `website:${source.id}` : "",
    name: values.fullName,
    phone: values.phone,
    email: values.email,
    company: values.companyName,
    location: buildLocation(values),
    machineName: values.machineInterest,
    machineType: values.machineInterest,
    message: buildDiscussion(values),
    leadCategory: pickRuntimeValue(process.env.CRM_ENQUIRY_LEAD_CATEGORY) || DEFAULT_LEAD_CATEGORY,
    assignedTo,
    salesPerson: assignedTo,
    source: "website",
    submittedAt: source?.createdAt ?? new Date().toISOString(),
  };
}

export async function sendContactEnquiryToCrm(values: ContactFormValues, source?: CrmSyncSource) {
  const endpoint = pickRuntimeValue(process.env.CRM_ENQUIRY_ENDPOINT);
  const secret = pickRuntimeValue(process.env.CRM_ENQUIRY_SECRET);

  if (!endpoint || !secret) {
    return { skipped: true, reason: "CRM enquiry sync is not configured." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    pickRuntimeNumber(process.env.CRM_ENQUIRY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  );

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        ...(source?.id ? { "Idempotency-Key": `website:${source.id}` } : {}),
      },
      body: JSON.stringify(buildCrmPayload(values, source)),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`CRM enquiry sync failed (${response.status}): ${body || response.statusText}`);
  }

  return { skipped: false };
}