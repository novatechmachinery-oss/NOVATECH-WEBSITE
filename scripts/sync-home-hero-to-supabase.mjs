import { readFile } from "node:fs/promises";
import path from "node:path";

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
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
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
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
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
}

async function main() {
  await ensureBucketExists();

  const heroSlides = [];
  for (const imageName of imageNames) {
    heroSlides.push(await uploadImage(imageName));
  }

  await updateSiteSettings(heroSlides);

  console.log(`Synced ${heroSlides.length} home hero images to Supabase.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
