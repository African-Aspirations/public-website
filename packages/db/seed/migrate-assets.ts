/**
 * Upload every legacy image the seed references to Cloudinary, and write
 * seed/assets.manifest.json (legacy path → Cloudinary public_id + dimensions).
 * Only referenced images are migrated; the rest of legacy public/ is dropped.
 *
 *   bun seed/migrate-assets.ts --dry-run          # list, check files, no upload
 *   CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=… \
 *     bun seed/migrate-assets.ts                   # upload (resumable)
 *
 * LEGACY_PUBLIC defaults to the legacy worktree's public/ folder.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve as resolvePath } from "node:path";
import sharp from "sharp";
import { content } from "./content";
import { collectAssets } from "./walk";

export type ManifestEntry = { publicId: string; width: number; height: number; format: string };
export type Manifest = Record<string, ManifestEntry>;

const MANIFEST = resolvePath(import.meta.dir, "assets.manifest.json");
const LEGACY_PUBLIC = resolvePath(
  process.env.LEGACY_PUBLIC ?? join(import.meta.dir, "../../../../aa-website-legacy/public"),
);
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "aa";
const MAX_UPLOAD_BYTES = 9.5 * 1024 * 1024; // Cloudinary free plan caps images at 10 MB
const MAX_EDGE = 3200; // nothing on the site is ever shown wider than this

const dryRun = process.argv.includes("--dry-run");

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/** Readable, stable public_id: aa/<alt-or-filename>-<6-char hash of legacy path>. */
export function publicIdFor(path: string, alt: string) {
  const name = slugify(alt) || slugify(basename(path, extname(path))) || "image";
  const hash = createHash("sha1").update(path).digest("hex").slice(0, 6);
  return `${FOLDER}/${name}-${hash}`;
}

export async function prepare(file: string): Promise<{ data: Buffer; note?: string }> {
  const raw = readFileSync(file);
  if (extname(file).toLowerCase() === ".svg" || raw.length <= MAX_UPLOAD_BYTES)
    return { data: raw };
  // Too big for Cloudinary: downscale and re-encode as high-quality JPEG/PNG.
  const img = sharp(raw)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  const meta = await sharp(raw).metadata();
  const data = meta.hasAlpha
    ? await img.png({ compressionLevel: 9 }).toBuffer()
    : await img.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return {
    data,
    note: `resized ${(raw.length / 1048576).toFixed(1)} MB → ${(data.length / 1048576).toFixed(1)} MB`,
  };
}

export async function upload(
  data: Buffer,
  filename: string,
  publicId: string,
): Promise<ManifestEntry> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret)
    throw new Error("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = { overwrite: "false", public_id: publicId, timestamp };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = createHash("sha1")
    .update(toSign + secret)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(data)]), filename);
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  form.append("api_key", key);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await res.json()) as {
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
    error?: { message: string };
  };
  if (!res.ok || !json.public_id) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  return {
    publicId: json.public_id,
    width: json.width ?? 0,
    height: json.height ?? 0,
    format: json.format ?? "",
  };
}

async function main() {
  const assets = collectAssets(content);
  const manifest: Manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  let missing = 0;
  let totalBytes = 0;

  console.log(
    `${assets.size} referenced images; legacy public/ at ${LEGACY_PUBLIC}${dryRun ? " (dry run)" : ""}\n`,
  );
  for (const [path, alt] of [...assets].sort()) {
    const file = join(LEGACY_PUBLIC, path);
    if (!existsSync(file)) {
      console.log(`✗ MISSING  ${path}`);
      missing++;
      continue;
    }
    const size = statSync(file).size;
    totalBytes += size;
    const publicId = publicIdFor(path, alt);
    if (manifest[path]) {
      console.log(`= done     ${path} → ${manifest[path].publicId}`);
      continue;
    }
    if (dryRun) {
      const big = size > MAX_UPLOAD_BYTES ? "  (will be resized)" : "";
      console.log(`· upload   ${path} (${(size / 1048576).toFixed(1)} MB) → ${publicId}${big}`);
      continue;
    }
    const { data, note } = await prepare(file);
    manifest[path] = await upload(data, basename(path), publicId);
    writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`); // resumable
    console.log(`✓ uploaded ${path} → ${manifest[path].publicId}${note ? ` (${note})` : ""}`);
  }

  console.log(
    `\n${assets.size - missing} found, ${missing} missing, ${(totalBytes / 1048576).toFixed(1)} MB source total.`,
  );
  if (missing) process.exit(1);
}

if (import.meta.main) await main();
