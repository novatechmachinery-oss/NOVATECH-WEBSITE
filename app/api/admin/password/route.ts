import { readFile, writeFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { isReadOnlyFilesystem, resolveProjectPath } from "@/lib/project-paths";

function updateEnvValue(content: string, key: string, value: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedKey}=.*$`, "m");

  if (pattern.test(content)) {
    return content.replace(pattern, `${key}=${value}`);
  }

  return `${content.trimEnd()}\n${key}=${value}\n`;
}

export async function POST(request: Request) {
  if (isReadOnlyFilesystem()) {
    return NextResponse.json(
      { error: "Modifying password dynamically is not allowed in this environment. Please update environment variables in your Vercel deployment settings." },
      { status: 405 }
    );
  }
  try {
    const body = (await request.json()) as {
      password?: string;
      confirmPassword?: string;
    };

    const password = typeof body.password === "string" ? body.password.trim() : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword.trim() : "";

    if (!password || !confirmPassword) {
      return NextResponse.json({ error: "Both password fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const envPath = resolveProjectPath(".env.local");
    const existing = await readFile(envPath, "utf8");
    const updated = updateEnvValue(existing, "ADMIN_PASSWORD", password);
    await writeFile(envPath, updated, "utf8");

    return NextResponse.json({
      message: "Admin password updated in .env.local. Restart the dev server to apply it.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update password." },
      { status: 400 },
    );
  }
}
