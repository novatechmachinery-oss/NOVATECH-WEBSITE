import "server-only";

import type { ContactFormValues } from "@/lib/contactForm";
import { supabaseRest } from "@/lib/supabase";

function buildLeadPayload(values: ContactFormValues) {
  return {
    name: [values.firstName, values.lastName].filter(Boolean).join(" "),
    email: values.email,
    phone: values.phone,
    machine_interested: values.machineInterest,
    message: values.message,
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
