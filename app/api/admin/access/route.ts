import { readFile, writeFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getAdminCredentials } from "@/lib/admin-auth";
import { resolveProjectPath } from "@/lib/project-paths";

function updateEnvValue(content: string, key: string, value: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedKey}=.*$`, "m");

  if (pattern.test(content)) {
    return content.replace(pattern, `${key}=${value}`);
  }

  return `${content.trimEnd()}\n${key}=${value}\n`;
}

export async function GET() {
  const { email, password } = getAdminCredentials();
  return NextResponse.json({ email, password });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Admin email is required." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Admin password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    const envPath = resolveProjectPath(".env.local");
    const existing = await readFile(envPath, "utf8");
    const nextWithEmail = updateEnvValue(existing, "ADMIN_EMAIL", email);
    const nextWithPassword = updateEnvValue(nextWithEmail, "ADMIN_PASSWORD", password);
    await writeFile(envPath, nextWithPassword, "utf8");

    return NextResponse.json({
      email,
      password,
      message: "Admin login settings updated in .env.local. Restart the dev server to apply them.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update admin access." },
      { status: 400 },
    );
  }
}
