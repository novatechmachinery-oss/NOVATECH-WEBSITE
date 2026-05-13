import { NextResponse } from "next/server";

import { uploadImageFileToStorage } from "@/lib/image-storage";
import { hasSupabaseConfig } from "@/lib/supabase";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"];

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase Storage is not configured." },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const machineId = formData.get("machineId");
    const imageIndex = formData.get("imageIndex");
    const file = formData.get("file");

    if (!machineId || typeof machineId !== "string") {
      return NextResponse.json({ error: "machineId is required." }, { status: 400 });
    }

    if (imageIndex === null || isNaN(Number(imageIndex))) {
      return NextResponse.json({ error: "imageIndex must be a number." }, { status: 400 });
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required." }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only image files are allowed.` },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 10MB.` },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const publicUrl = await uploadImageFileToStorage(
      fileBuffer,
      machineId,
      Number(imageIndex),
    );

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed." },
      { status: 500 },
    );
  }
}
