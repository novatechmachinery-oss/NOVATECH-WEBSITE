import "server-only";

import sharp from "sharp";

import { hasSupabaseConfig, supabaseStorageUpload } from "@/lib/supabase";

export const MACHINE_IMAGES_BUCKET = "machine-images";
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 82;

/**
 * Returns true if the string is a base64 image (either raw or with data URI prefix).
 */
export function isBase64Image(value: string): boolean {
  return (
    value.startsWith("data:image/") ||
    // Raw base64: at least 100 chars of valid base64
    (/^[A-Za-z0-9+/]/.test(value) && value.length > 100 && !value.startsWith("http"))
  );
}

/**
 * Sanitize a string to be a URL-safe Supabase Storage path segment.
 * Replaces spaces and special chars with hyphens.
 */
export function sanitizePathSegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "unknown";
}

function buildMachineFolder(machineId: string, machineName?: string): string {
  return sanitizePathSegment(machineName?.trim() || machineId);
}

export function buildMachineImageStoragePath(machineId: string, imageIndex: number, machineName?: string, extension = "webp"): string {
  const machineFolder = buildMachineFolder(machineId, machineName);
  const safeMachineId = sanitizePathSegment(machineId);
  const version = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${machineFolder}/${safeMachineId}-${imageIndex}-${version}.${extension}`;
}

/**
 * Strip the `data:image/...;base64,` prefix if present, returning raw base64.
 */
function stripBase64Prefix(value: string): string {
  const match = value.match(/^data:image\/[^;]+;base64,(.+)$/);
  return match ? match[1] : value;
}

/**
 * Optimize an image buffer using Sharp.
 * - Converts to WebP at quality 82
 * - Resizes to max 1600px width/height (preserves aspect ratio, no upscale)
 * - Strips EXIF metadata
 */
export async function optimizeImageBuffer(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
    .rotate() // auto-orient based on EXIF
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Decode a base64 image string, optimize it with Sharp, and upload to Supabase Storage.
 * Returns the public URL on success, or null on failure.
 */
export async function uploadBase64ImageToStorage(
  base64Value: string,
  machineId: string,
  imageIndex: number,
  machineName?: string,
): Promise<string | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  try {
    const rawBase64 = stripBase64Prefix(base64Value);
    const rawBuffer = Buffer.from(rawBase64, "base64");
    const optimizedBuffer = await optimizeImageBuffer(rawBuffer);

    const storagePath = buildMachineImageStoragePath(machineId, imageIndex, machineName);

    return await supabaseStorageUpload(MACHINE_IMAGES_BUCKET, storagePath, optimizedBuffer, "image/webp");
  } catch (error) {
    console.error(
      `Failed to upload image ${imageIndex} for machine ${machineId}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * Upload a raw file buffer (from admin panel upload), optimize with Sharp,
 * and store in Supabase Storage. Returns the public URL.
 */
export async function uploadImageFileToStorage(
  fileBuffer: Buffer,
  machineId: string,
  imageIndex: number,
  machineName?: string,
): Promise<string> {
  const optimizedBuffer = await optimizeImageBuffer(fileBuffer);
  const storagePath = buildMachineImageStoragePath(machineId, imageIndex, machineName);

  return supabaseStorageUpload(MACHINE_IMAGES_BUCKET, storagePath, optimizedBuffer, "image/webp");
}

/**
 * Upload a browser-optimized image buffer without re-compressing it server-side.
 */
export async function uploadOptimizedImageFileToStorage(
  fileBuffer: Buffer,
  machineId: string,
  imageIndex: number,
  machineName: string | undefined,
  contentType: "image/webp" | "image/jpeg",
): Promise<string> {
  const extension = contentType === "image/webp" ? "webp" : "jpg";
  const storagePath = buildMachineImageStoragePath(machineId, imageIndex, machineName, extension);

  return supabaseStorageUpload(MACHINE_IMAGES_BUCKET, storagePath, fileBuffer, contentType);
}