import { NextResponse } from "next/server";

import { sendSmtpTestEmail } from "@/lib/contact-email.service";
import type { SiteSettings } from "@/lib/site-settings.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SmtpPayload = SiteSettings["operations"]["smtp"];

export async function POST(request: Request) {
  let body: Partial<SmtpPayload>;

  try {
    body = (await request.json()) as Partial<SmtpPayload>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const testEmail = typeof body.testEmail === "string" ? body.testEmail.trim() : "";

  if (!EMAIL_PATTERN.test(testEmail)) {
    return NextResponse.json({ error: "Enter a valid test email address." }, { status: 400 });
  }

  try {
    await sendSmtpTestEmail({
      host: typeof body.host === "string" ? body.host : "",
      port: typeof body.port === "string" ? body.port : "",
      username: typeof body.username === "string" ? body.username : "",
      password: typeof body.password === "string" ? body.password : "",
      fromEmail: typeof body.fromEmail === "string" ? body.fromEmail : "",
      fromName: typeof body.fromName === "string" ? body.fromName : "",
      secure: Boolean(body.secure),
      testEmail,
    });

    return NextResponse.json({ message: `Test email sent to ${testEmail}.` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send test email." },
      { status: 400 },
    );
  }
}
