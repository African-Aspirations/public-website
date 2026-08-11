// Signed session tokens using the Web Crypto API (crypto.subtle), which is
// available in both the Node.js runtime (route handlers) and the Edge
// runtime (middleware) — unlike `jsonwebtoken`, which depends on Node's
// `crypto` module and cannot run in middleware.

const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me-in-production";

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[AUTH] AUTH_SECRET is not set. Using an insecure default — set AUTH_SECRET in production.",
  );
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  try {
    const payloadBytes = base64UrlDecode(payloadPart);
    const signatureBytes = base64UrlDecode(signaturePart);
    const key = await getKey();

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      payloadBytes,
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
