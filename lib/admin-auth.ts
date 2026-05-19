import "server-only";

const COOKIE_NAME = "nv_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type AdminCredentials = {
  email: string;
  password: string;
  secret: string;
};

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0));
}

export function getAdminCredentials(): AdminCredentials {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD ?? "").trim();
  const secret = (process.env.ADMIN_SESSION_SECRET ?? password).trim();

  return { email, password, secret };
}

export function isAdminConfigured() {
  const { email, password, secret } = getAdminCredentials();
  return Boolean(email && password && secret);
}

async function createHmacKey(secret: string, usage: KeyUsage) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

function getSessionPayload(email: string, password: string) {
  return `${email}:${password}`;
}

export async function createAdminToken(email: string, password: string, secret: string) {
  const key = await createHmacKey(secret, "sign");
  const message = new TextEncoder().encode(getSessionPayload(email, password));
  const signature = await crypto.subtle.sign("HMAC", key, message);
  return base64UrlEncode(new Uint8Array(signature));
}

export async function verifyAdminToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const { email, password, secret } = getAdminCredentials();
  if (!email || !password || !secret) {
    return false;
  }

  try {
    const key = await createHmacKey(secret, "verify");
    const signatureBytes = base64UrlDecode(token);
    const messageBytes = new TextEncoder().encode(getSessionPayload(email, password));
    return await crypto.subtle.verify("HMAC", key, signatureBytes, messageBytes);
  } catch {
    return false;
  }
}

export { COOKIE_MAX_AGE, COOKIE_NAME };
