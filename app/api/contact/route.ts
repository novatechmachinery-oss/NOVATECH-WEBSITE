import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { z } from "zod";

const ContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().default(""),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, message } = parsed.data;

    // Store as contact enquiry
    const { data: enquiry, error: enquiryErr } = await supabaseServer
      .from("contact_enquiries")
      .insert({ first_name: firstName, last_name: lastName, phone, email, message })
      .select()
      .single();

    if (enquiryErr) throw new Error(enquiryErr.message);

    // Also create a lead so it appears in the admin panel
    await supabaseServer.from("leads").insert({
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      interested_in: "General Enquiry",
      message,
      stage: "New",
      source: "contact_form",
    });

    return NextResponse.json(
      { data: { id: enquiry.id, message: "Enquiry submitted successfully" } },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
