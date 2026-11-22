import "server-only";
import { schema as s } from "@aa/db";
import { asc } from "drizzle-orm";
import { db } from "./db";
import { env } from "./env";

export type MediaOption = { id: string; alt: string; src: string; fallback: string; ratio: number };

/** Thumbnail from Cloudinary, plus the public site's dev image server as a fallback
 *  (used until the assets are uploaded to Cloudinary). */
export function thumb(publicId: string, width = 240) {
  const cloud = env().CLOUDINARY_CLOUD_NAME;
  const fallback = `${env().SITE_URL}/__dev-media/${encodeURIComponent(publicId)}?w=${width}`;
  const src = cloud
    ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`
    : fallback;
  return { src, fallback };
}

export async function mediaOptions(): Promise<MediaOption[]> {
  const rows = await db().select().from(s.media).orderBy(asc(s.media.alt));
  return rows.map((m) => ({
    id: m.id,
    alt: m.alt,
    ratio: m.width / m.height,
    ...thumb(m.publicId),
  }));
}
