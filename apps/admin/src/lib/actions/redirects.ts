"use server";
import { schema as s } from "@aa/db";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";
import { type FormState, fields, firstError } from "../form-data";

const Redirect = z.object({
  fromPath: z
    .string({ error: "Old path is required" })
    .regex(/^\/[^\s?#]*$/, "Old path: starts with / , no spaces, no ? or #")
    .transform((v) => (v.length > 1 ? v.replace(/\/+$/, "") : v)),
  toPath: z
    .string({ error: "New path is required" })
    .regex(/^(\/|https?:\/\/)\S*$/, "New path: /page or https://…"),
  statusCode: z.coerce
    .number()
    .pipe(z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)])),
});

/** Super admins only. Applied when the public site is next published. */
export async function saveRedirect(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff("super_admin");
  const r = Redirect.safeParse(fields(form, ["fromPath", "toPath", "statusCode"]));
  if (!r.success) return { error: firstError(r.error) };
  if (r.data.fromPath === r.data.toPath) return { error: "A redirect can't point to itself." };
  const t = s.redirects;
  const [clash] = await db()
    .select({ id: t.id })
    .from(t)
    .where(
      id ? and(eq(t.fromPath, r.data.fromPath), ne(t.id, id)) : eq(t.fromPath, r.data.fromPath),
    )
    .limit(1);
  if (clash) return { error: `${r.data.fromPath} already redirects somewhere.` };
  if (id) await db().update(t).set(r.data).where(eq(t.id, id));
  else await db().insert(t).values(r.data);
  await audit(me, id ? "update" : "create", "redirect", id, r.data);
  revalidatePath("/settings");
  return { saved: true };
}

export async function deleteRedirect(id: string) {
  const me = await requireStaff("super_admin");
  await db().delete(s.redirects).where(eq(s.redirects.id, id));
  await audit(me, "delete", "redirect", id);
  revalidatePath("/settings");
}
