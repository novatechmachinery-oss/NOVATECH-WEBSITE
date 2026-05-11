import { NextResponse } from "next/server";
import type { NewsletterFormValues } from "@/lib/newsletter.types";
import { saveSubscriberRecord } from "@/lib/newsletter.service";

export const runtime = "nodejs";

function validateNewsletterForm(values: NewsletterFormValues): string[] {
  const errors: string[] = [];

  if (!values.contact || values.contact.trim() === "") {
    errors.push("Please provide your email or phone number");
  }

  if (!values.channel || (values.channel !== "email" && values.channel !== "whatsapp")) {
    errors.push("Invalid subscription channel");
  }

  if (values.channel === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.contact)) {
      errors.push("Please provide a valid email address");
    }
  }

  if (values.channel === "whatsapp") {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(values.contact) || values.contact.replace(/\D/g, "").length < 10) {
      errors.push("Please provide a valid phone number");
    }
  }

  return errors;
}

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

  const values: NewsletterFormValues = {
    contact: ((payload as Record<string, unknown>)?.contact ?? "").toString().trim(),
    channel: ((payload as Record<string, unknown>)?.channel ?? "") as NewsletterFormValues["channel"],
  };

  const errors = validateNewsletterForm(values);

  if (errors.length > 0) {
    return NextResponse.json(
      {
        message: "Please check the form fields and try again.",
        errors,
      },
      { status: 400 },
    );
  }

  try {
    await saveSubscriberRecord(values);

    return NextResponse.json({
      message:
        values.channel === "email"
          ? "Thanks for subscribing! Check your email for confirmation."
          : "Thanks for subscribing! You'll receive WhatsApp updates from us.",
    });
  } catch (error) {
    console.error("Failed to save newsletter subscription.", error);

    return NextResponse.json(
      { message: "Failed to process your subscription. Please try again later." },
      { status: 500 },
    );
  }
}
