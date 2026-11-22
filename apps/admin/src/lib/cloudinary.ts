import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { env } from "./env";

/** Cloudinary credentials, or null when the media library isn't configured. */
export function cloudinary() {
  const e = env();
  if (!e.CLOUDINARY_CLOUD_NAME || !e.CLOUDINARY_API_KEY || !e.CLOUDINARY_API_SECRET) return null;
  return {
    cloud: e.CLOUDINARY_CLOUD_NAME,
    key: e.CLOUDINARY_API_KEY,
    secret: e.CLOUDINARY_API_SECRET,
  };
}

/** Cloudinary request signature: sha1 of the sorted params + API secret. */
export function sign(params: Record<string, string | number>, secret: string) {
  const base = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(base + secret)
    .digest("hex");
}

export const FOLDER = "aa";

/** Same readable scheme as the asset migration: aa/<alt>-<random>. */
export function newPublicId(alt: string) {
  const name =
    alt
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  return `${FOLDER}/${name}-${randomBytes(3).toString("hex")}`;
}

/** Remove an image from Cloudinary (and purge its CDN copies). */
export async function destroy(publicId: string) {
  const c = cloudinary();
  if (!c) throw new Error("Cloudinary is not configured");
  const params = {
    invalidate: "true",
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
  };
  const body = new URLSearchParams({
    ...params,
    timestamp: String(params.timestamp),
    api_key: c.key,
    signature: sign(params, c.secret),
  });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/image/destroy`, {
    method: "POST",
    body,
  });
  const json = (await res.json().catch(() => ({}))) as { result?: string };
  // "not found" is fine: legacy rows whose file was never uploaded.
  if (json.result !== "ok" && json.result !== "not found")
    throw new Error(`Cloudinary: ${json.result ?? res.status}`);
}
