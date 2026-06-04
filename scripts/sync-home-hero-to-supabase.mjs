import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const projectRoot = process.cwd();
const imageNames = ["10", "11", "12", "13", "14", "15", "16"];
const bucket = "site-images";
const storageFolder = "home-hero";

async function loadEnvFile() {
  const envPath = path.join(projectRoot, ".env.local");

  try {
    const envContent = await readFile(envPath, "utf8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env file and fall back to already-defined environment variables.
  }
}

await loadEnvFile();

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function ensureBucketExists() {
  const bucketUrl = `${supabaseUrl}/storage/v1/bucket/${bucket}`;
  const headers = {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
  };

  const existing = await fetch(bucketUrl, { headers });
  if (existing.ok) {
    return;
  }

  if (![400, 404].includes(existing.status)) {
    const body = await existing.text();
    throw new Error(`Bucket check failed (${existing.status}): ${body}`);
  }

  await fetchJson(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ["image/png", "image/jpeg", "image/webp"],
    }),
  });
}

async function uploadImage(imageName) {
  const filePath = path.join(projectRoot, "public", "images", `${imageName}.png`);
  const fileBuffer = await readFile(filePath);
  const storagePath = `${storageFolder}/${imageName}.png`;

  await fetchJson(`${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "x-upsert": "true",
    },
    body: new Uint8Array(fileBuffer),
  });

  return {
    id: `hero-${imageName}`,
    src: `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`,
    alt: `Novatech home banner slide ${imageName}`,
  };
}

async function updateSiteSettings(heroSlides) {
  const rows = await fetchJson(`${supabaseUrl}/rest/v1/site_settings?id=eq.main&select=settings`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  const currentSettings = rows?.[0]?.settings ?? {};
  const nextSettings = {
    ...currentSettings,
    home: {
      ...(currentSettings.home ?? {}),
      heroSlides,
    },
  };

  await fetchJson(`${supabaseUrl}/rest/v1/site_settings`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates, return=minimal",
    },
    body: JSON.stringify([
      {
        id: "main",
        settings: nextSettings,
      },
    ]),
  });

  return currentSettings;
}

function getStorageObjectFromPublicUrl(url) {
  const marker = `${supabaseUrl}/storage/v1/object/public/`;
  if (!url.startsWith(marker)) {
    return null;
  }

  const remainder = url.slice(marker.length);
  const [bucketName, ...pathParts] = remainder.split("/");

  if (!bucketName || pathParts.length === 0) {
    return null;
  }

  return {
    bucket: bucketName,
    path: pathParts.join("/"),
  };
}

async function removeStorageObjects(bucketName, objectPaths) {
  if (objectPaths.length === 0) {
    return;
  }

  const { error } = await supabaseAdmin.storage.from(bucketName).remove(objectPaths);
  if (error) {
    throw new Error(`Failed to delete old storage objects from ${bucketName}: ${error.message}`);
  }
}

async function cleanupOldHeroImages(currentSettings, heroSlides) {
  const desiredPaths = new Set(
    heroSlides
      .map((slide) => getStorageObjectFromPublicUrl(slide.src))
      .filter(Boolean)
      .map((entry) => `${entry.bucket}/${entry.path}`),
  );

  const oldSlides = currentSettings?.home?.heroSlides ?? [];
  const oldPathsByBucket = new Map();

  for (const slide of oldSlides) {
    if (!slide?.src || typeof slide.src !== "string") {
      continue;
    }

    const storageObject = getStorageObjectFromPublicUrl(slide.src);
    if (!storageObject) {
      continue;
    }

    const fullPathKey = `${storageObject.bucket}/${storageObject.path}`;
    if (desiredPaths.has(fullPathKey)) {
      continue;
    }

    const bucketPaths = oldPathsByBucket.get(storageObject.bucket) ?? [];
    bucketPaths.push(storageObject.path);
    oldPathsByBucket.set(storageObject.bucket, bucketPaths);
  }

  const { data: listedFiles, error: listError } = await supabaseAdmin.storage
    .from(bucket)
    .list(storageFolder, { limit: 100 });

  if (listError) {
    throw new Error(`Failed to list existing home hero images: ${listError.message}`);
  }

  const latestFolderPaths = new Set(imageNames.map((imageName) => `${storageFolder}/${imageName}.png`));
  const extraFolderPaths = (listedFiles ?? [])
    .filter((file) => file.name && !latestFolderPaths.has(`${storageFolder}/${file.name}`))
    .map((file) => `${storageFolder}/${file.name}`);

  if (extraFolderPaths.length > 0) {
    const bucketPaths = oldPathsByBucket.get(bucket) ?? [];
    bucketPaths.push(...extraFolderPaths);
    oldPathsByBucket.set(bucket, bucketPaths);
  }

  for (const [bucketName, objectPaths] of oldPathsByBucket.entries()) {
    const uniquePaths = [...new Set(objectPaths)];
    await removeStorageObjects(bucketName, uniquePaths);
  }
}

async function main() {
  await ensureBucketExists();

  const heroSlides = [];
  for (const imageName of imageNames) {
    heroSlides.push(await uploadImage(imageName));
  }

  const currentSettings = await updateSiteSettings(heroSlides);
  await cleanupOldHeroImages(currentSettings, heroSlides);

  console.log(`Synced ${heroSlides.length} home hero images to Supabase.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
