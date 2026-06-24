import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const JPEG_QUALITY = 92;
const FALLBACK_HOSTS = ["gjahhucsamguyeerxbpr.supabase.co"];

function getAllowedRemoteHosts() {
  const hosts = new Set(FALLBACK_HOSTS);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;

  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).hostname);
    } catch {
      // Ignore malformed environment values and keep the fixed fallback host.
    }
  }

  return hosts;
}

function sanitizeFilename(value: string | null) {
  const cleaned = (value ?? "novatech-machine-image")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "novatech-machine-image";
}

function safePublicPath(pathname: string) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\/+/, "");
  const publicRoot = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicRoot, relativePath);
  const relation = path.relative(publicRoot, filePath);

  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    return null;
  }

  return filePath;
}

async function loadImageBuffer(src: string, requestUrl: URL) {
  if (src.startsWith("/") && !src.startsWith("//")) {
    const filePath = safePublicPath(src);

    if (!filePath) {
      throw new Error("Invalid local image path.");
    }

    return readFile(filePath);
  }

  const imageUrl = new URL(src);

  if (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") {
    throw new Error("Unsupported image URL.");
  }

  if (imageUrl.host === requestUrl.host) {
    const filePath = safePublicPath(imageUrl.pathname);

    if (!filePath) {
      throw new Error("Invalid same-site image path.");
    }

    return readFile(filePath);
  }

  if (!getAllowedRemoteHosts().has(imageUrl.hostname)) {
    throw new Error("Remote image host is not allowed.");
  }

  const response = await fetch(imageUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Image fetch failed with status ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    throw new Error("Remote file is not an image.");
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const src = requestUrl.searchParams.get("src");

  if (!src) {
    return NextResponse.json({ error: "Missing image source." }, { status: 400 });
  }

  try {
    const imageBuffer = await loadImageBuffer(src, requestUrl);
    const jpegBuffer = await sharp(imageBuffer)
      .rotate()
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    const filename = `${sanitizeFilename(requestUrl.searchParams.get("name"))}.jpg`;

    return new Response(new Uint8Array(jpegBuffer), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error(
      "[download-image] JPEG conversion failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json({ error: "Image could not be converted to JPEG." }, { status: 422 });
  }
}
