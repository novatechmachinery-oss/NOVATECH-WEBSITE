import { NextResponse } from "next/server";

import { buildMachineImageStoragePath, MACHINE_IMAGES_BUCKET } from "@/lib/image-storage";
import {
  getSupabaseStoragePublicUrl,
  hasSupabaseConfig,
  supabaseStorageCreateSignedUploadUrl,
} from "@/lib/supabase";

const ALLOWED_DIRECT_UPLOAD_TYPES = ["image/webp", "image/jpeg"];

type SignedUploadRequest = {
  machineId?: unknown;
  machineName?: unknown;
  imageIndex?: unknown;
  contentType?: unknown;
};

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase Storage is not configured." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as SignedUploadRequest;
    const machineId = typeof body.machineId === "string" ? body.machineId.trim() : "";
    const machineName = typeof body.machineName === "string" ? body.machineName.trim() : "";
    const contentType = typeof body.contentType === "string" ? body.contentType.trim() : "";
    const imageIndex = Number(body.imageIndex);

    if (!machineId) {
      return NextResponse.json({ error: "machineId is required." }, { status: 400 });
    }

    if (!Number.isInteger(imageIndex) || imageIndex < 0) {
      return NextResponse.json({ error: "imageIndex must be a non-negative number." }, { status: 400 });
    }

    if (!ALLOWED_DIRECT_UPLOAD_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Only optimized WebP or JPEG images can use direct upload." },
        { status: 400 },
      );
    }

    const extension = contentType === "image/webp" ? "webp" : "jpg";
    const storagePath = buildMachineImageStoragePath(machineId, imageIndex, machineName || undefined, extension);
    const signedUpload = await supabaseStorageCreateSignedUploadUrl(MACHINE_IMAGES_BUCKET, storagePath);
    const publicUrl = getSupabaseStoragePublicUrl(MACHINE_IMAGES_BUCKET, storagePath);

    return NextResponse.json({
      ...signedUpload,
      path: storagePath,
      publicUrl,
      contentType,
    });
  } catch (error) {
    console.error("Signed image upload URL failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create signed upload URL." },
      { status: 500 },
    );
  }
}