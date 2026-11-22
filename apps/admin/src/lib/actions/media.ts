"use server";
import { schema as s } from "@aa/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { cloudinary, destroy, newPublicId, sign } from "../cloudinary";
import { db } from "../db";
import { type FormState, fields, firstError, optText, reqText } from "../form-data";
import { mediaUsage } from "../media-usage";

const Meta = z.object({ alt: reqText(300, "Alt text"), credit: optText(200) });

export type UploadTicket = {
  url: string;
  fields: Record<string, string>;
};

/**
 * One-time signature for a direct browser → Cloudinary upload. The secret never
 * leaves the server; the signature fixes the public_id, so it can't be reused
 * to overwrite another image.
 */
export async function signUpload(alt: string): Promise<UploadTicket | { error: string }> {
  await requireStaff();
  const c = cloudinary();
  if (!c) return { error: "Cloudinary isn't configured (see apps/admin/.env.example)." };
  const r = Meta.shape.alt.safeParse(alt.trim());
  if (!r.success) return { error: firstError(r.error) };
  const params = {
    overwrite: "false",
    public_id: newPublicId(r.data),
    timestamp: Math.floor(Date.now() / 1000),
  };
  return {
    url: `https://api.cloudinary.com/v1_1/${c.cloud}/image/upload`,
    fields: {
      ...params,
      timestamp: String(params.timestamp),
      api_key: c.key,
      signature: sign(params, c.secret),
    },
  };
}

const Uploaded = z.object({
  public_id: z.string().startsWith("aa/"),
  version: z.number().int(),
  signature: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().max(10),
});

/** Record an upload. Cloudinary's response signature proves it came from our account. */
export async function saveUpload(
  result: unknown,
  alt: string,
  credit: string,
): Promise<{ id?: string; error?: string }> {
  const me = await requireStaff();
  const c = cloudinary();
  if (!c) return { error: "Cloudinary isn't configured." };
  const u = Uploaded.safeParse(result);
  const m = Meta.safeParse({ alt: alt.trim(), credit: credit.trim() || undefined });
  if (!u.success || !m.success)
    return { error: m.success ? "Unexpected upload response." : firstError(m.error) };
  if (
    sign({ public_id: u.data.public_id, version: u.data.version }, c.secret) !== u.data.signature
  ) {
    return { error: "Upload could not be verified." };
  }
  const [row] = await db()
    .insert(s.media)
    .values({
      publicId: u.data.public_id,
      width: u.data.width,
      height: u.data.height,
      format: u.data.format,
      alt: m.data.alt,
      credit: m.data.credit ?? null,
    })
    .returning({ id: s.media.id });
  await audit(me, "upload", "media", row?.id ?? null, { publicId: u.data.public_id });
  revalidatePath("/media");
  return { id: row?.id };
}

export async function updateMedia(
  id: string,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const r = Meta.safeParse(fields(form, ["alt", "credit"]));
  if (!r.success) return { error: firstError(r.error) };
  await db()
    .update(s.media)
    .set({ alt: r.data.alt, credit: r.data.credit ?? null })
    .where(eq(s.media.id, id));
  await audit(me, "update", "media", id);
  revalidatePath("/media");
  return { saved: true };
}

/** Delete from Cloudinary and the library; refused while the image is in use. */
export async function deleteMedia(id: string) {
  const me = await requireStaff();
  const [m] = await db().select().from(s.media).where(eq(s.media.id, id)).limit(1);
  if (!m) redirect("/media");
  if ((await mediaUsage(id)).length) redirect(`/media/${id}?inuse=1`);
  await destroy(m.publicId);
  await db().delete(s.media).where(eq(s.media.id, id));
  await audit(me, "delete", "media", id, { publicId: m.publicId });
  revalidatePath("/media");
  redirect("/media");
}
