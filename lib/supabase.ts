import "server-only";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

// Service role key — used ONLY server-side for Storage uploads and bucket management.
// Never sent to the client. Falls back to anon key if not configured.
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabasePublishableKey;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseConfig() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are missing.");
  }

  return {
    url: supabaseUrl.replace(/\/+$/, ""),
    publishableKey: supabasePublishableKey,
    /** Use this key for server-side Storage uploads — has full write access. */
    storageKey: supabaseServiceRoleKey,
  };
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

/**
 * Like supabaseRest but uses the service role key — bypasses RLS.
 * Use ONLY in server-side admin routes for write operations (PATCH, POST, DELETE).
 */
export async function supabaseRestAdmin<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { url, storageKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: storageKey,
      Authorization: `Bearer ${storageKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase admin request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

/**
 * Upload a binary buffer to Supabase Storage.
 * Sets immutable cache headers so the CDN and browser cache forever.
 * Uses x-upsert so re-running the migration safely overwrites existing files.
 * Returns the public URL of the uploaded file.
 */
export async function supabaseStorageUpload(
  bucket: string,
  storagePath: string,
  fileBuffer: Buffer,
  contentType: string = "image/webp",
): Promise<string> {
  const { url, storageKey } = getSupabaseConfig();

  const uploadUrl = `${url}/storage/v1/object/${bucket}/${storagePath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: storageKey,
      Authorization: `Bearer ${storageKey}`,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "x-upsert": "true",
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${body}`);
  }

  return getSupabaseStoragePublicUrl(bucket, storagePath);
}

/**
 * Returns the public CDN URL for a Supabase Storage object.
 */
export function getSupabaseStoragePublicUrl(bucket: string, storagePath: string): string {
  const { url } = getSupabaseConfig();
  return `${url}/storage/v1/object/public/${bucket}/${storagePath}`;
}

/**
 * Ensures a Supabase Storage bucket exists and is public.
 * Creates it if it doesn't exist. Safe to call multiple times.
 * Never throws — auth/network errors are logged and ignored so the
 * migration can proceed and the upload itself will surface any real errors.
 */
export async function ensureStorageBucket(bucket: string): Promise<void> {
  const { url, storageKey } = getSupabaseConfig();

  let needsCreate = false;

  try {
    const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
      headers: {
        apikey: storageKey,
        Authorization: `Bearer ${storageKey}`,
      },
    });

    if (res.ok) return; // Bucket confirmed to exist

    if (res.status === 401 || res.status === 403) {
      // Anon key can't list buckets — assume it exists (was manually created).
      console.warn(`[ensureStorageBucket] Auth error ${res.status} checking bucket "${bucket}". Assuming it exists.`);
      return;
    }

    if (res.status === 404 || res.status === 400) {
      needsCreate = true;
    } else {
      const body = await res.text();
      console.warn(`[ensureStorageBucket] Unexpected ${res.status} checking bucket. Proceeding anyway. ${body}`);
      return;
    }
  } catch (err) {
    console.warn(`[ensureStorageBucket] Network error checking bucket:`, err);
    return;
  }

  if (!needsCreate) return;

  // Try to create the bucket
  try {
    const res = await fetch(`${url}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        apikey: storageKey,
        Authorization: `Bearer ${storageKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true,
        file_size_limit: 10485760, // 10MB
        allowed_mime_types: ["image/webp", "image/jpeg", "image/png", "image/gif"],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`[ensureStorageBucket] Could not create bucket "${bucket}": ${res.status} ${body}`);
    }
  } catch (err) {
    console.warn(`[ensureStorageBucket] Failed to create bucket:`, err);
  }
}