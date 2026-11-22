"use server";
import { schema as s } from "@aa/db";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";
import {
  type FormState,
  fields,
  firstError,
  optText,
  reqText,
  slug,
  slugify,
  status,
  uuidOpt,
} from "../form-data";

const Post = z.object({
  title: reqText(200, "Title"),
  slug,
  excerpt: optText(400),
  body: reqText(100000, "Body"),
  coverId: uuidOpt,
  authorId: uuidOpt,
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date: use the date picker")
    .optional(),
  seoTitle: optText(70),
  seoDescription: optText(170),
  status,
});

export async function savePost(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const raw = fields(form, Object.keys(Post.shape));
  raw.slug ??= raw.title ? slugify(raw.title) : undefined;
  const r = Post.safeParse(raw);
  if (!r.success) return { error: firstError(r.error) };
  const t = s.posts;
  const [clash] = await db()
    .select({ id: t.id })
    .from(t)
    .where(id ? and(eq(t.slug, r.data.slug), ne(t.id, id)) : eq(t.slug, r.data.slug))
    .limit(1);
  if (clash) return { error: `Another post already uses “${r.data.slug}”.` };
  // Publishing without a date stamps today.
  const date = r.data.publishedAt
    ? new Date(`${r.data.publishedAt}T09:00:00Z`)
    : r.data.status === "published"
      ? new Date()
      : null;
  const v = {
    ...r.data,
    excerpt: r.data.excerpt ?? null,
    coverId: r.data.coverId ?? null,
    authorId: r.data.authorId ?? null,
    publishedAt: date,
    seoTitle: r.data.seoTitle ?? null,
    seoDescription: r.data.seoDescription ?? null,
  };
  if (id) {
    await db().update(t).set(v).where(eq(t.id, id));
    await audit(me, "update", "post", id);
    revalidatePath("/insights");
    return { saved: true };
  }
  const [row] = await db().insert(t).values(v).returning({ id: t.id });
  await audit(me, "create", "post", row?.id ?? null);
  revalidatePath("/insights");
  redirect("/insights");
}

export async function deletePost(id: string) {
  const me = await requireStaff();
  await db().delete(s.posts).where(eq(s.posts.id, id));
  await audit(me, "delete", "post", id);
  revalidatePath("/insights");
  redirect("/insights");
}
