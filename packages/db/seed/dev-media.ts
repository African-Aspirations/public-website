/**
 * Dev-only: serve the legacy images by their future Cloudinary public_id, so
 * `bun dev` shows real photos before Cloudinary is set up. Used by the
 * apps/web dev-media integration; never imported by production code.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve as resolvePath } from "node:path";
import sharp from "sharp";
import { content } from "./content";
import { publicIdFor } from "./migrate-assets";
import { collectAssets } from "./walk";

const LEGACY_PUBLIC = resolvePath(
  process.env.LEGACY_PUBLIC ?? join(import.meta.dirname, "../../../../aa-website-legacy/public"),
);

let map: Map<string, string> | undefined;
/** publicId → absolute path of the legacy file. */
export function legacyAssetMap() {
  map ??= new Map(
    [...collectAssets(content)].map(([path, alt]) => [
      publicIdFor(path, alt),
      join(LEGACY_PUBLIC, path),
    ]),
  );
  return map;
}

const cache = new Map<string, Buffer>();
/** Resized WebP of a legacy image, or null if unknown/missing. */
export async function renderLegacyImage(publicId: string, width: number, height?: number) {
  const file = legacyAssetMap().get(publicId);
  if (!file || !existsSync(file)) return null;
  const key = `${publicId}:${width}:${height ?? ""}`;
  let out = cache.get(key);
  if (!out) {
    out = await sharp(readFileSync(file), { density: 300 })
      .rotate()
      .resize({
        width,
        height,
        fit: height ? "cover" : "inside",
        withoutEnlargement: !file.endsWith(".svg"),
      })
      .webp({ quality: 80 })
      .toBuffer();
    cache.set(key, out);
  }
  return out;
}

export const legacyPublicDir = LEGACY_PUBLIC;
