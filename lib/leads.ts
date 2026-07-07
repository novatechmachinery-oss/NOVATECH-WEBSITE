import "server-only";

import type { ContactFormValues } from "@/lib/contactForm";
import { supabaseRest } from "@/lib/supabase";

function buildLeadPayload(values: ContactFormValues) {
  const details = [
    `Country: ${values.country}`,
    values.companyName ? `Company Name: ${values.companyName}` : "",
    values.companyAddress ? `Company Address: ${values.companyAddress}` : "",
  ].filter(Boolean).join("\n");

  return {
    name: values.fullName,
    email: values.email,
    phone: values.phone,
    machine_interested: values.machineInterest,
    message: `${details}\n\n${values.message}`,
    lead_source: "website",
  };
}

export async function saveLead(values: ContactFormValues) {
  await supabaseRest("leads", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify([buildLeadPayload(values)]),
  });
}
