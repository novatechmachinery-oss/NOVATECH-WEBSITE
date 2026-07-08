import { NextResponse } from "next/server";
import {
  hasContactFormErrors,
  normalizeContactForm,
  validateContactForm,
} from "@/lib/contactForm";
import { sendContactEnquiryEmail } from "@/lib/contact-email.service";
import { sendContactEnquiryToCrm } from "@/lib/crm-enquiry.service";
import { saveLeadRecord } from "@/lib/leads.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body. Please refresh and try again." },
      { status: 400 },
    );
  }

  const values = normalizeContactForm((payload ?? {}) as Record<string, unknown>);
  const errors = validateContactForm(values);

  if (hasContactFormErrors(errors)) {
    return NextResponse.json(
      {
        message: "Please check the form fields and try again.",
        errors,
      },
      { status: 400 },
    );
  }

  try {
    const leadRecord = await saveLeadRecord(values);

    try {
      await sendContactEnquiryEmail(values);
    } catch (emailError) {
      console.error("Failed to send contact enquiry email.", emailError);
    }

    try {
      await sendContactEnquiryToCrm(values, leadRecord);
    } catch (crmError) {
      console.error("Failed to sync contact enquiry to CRM.", crmError);
    }

    return NextResponse.json({
      message: "Thanks for reaching out. Our team will contact you within 24 hours.",
    });
  } catch (error) {
    console.error("Failed to save contact enquiry.", error);

    return NextResponse.json(
      {
        message:
          "Your enquiry could not be saved right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
