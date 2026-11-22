"use server";
import { schema as s } from "@aa/db";
import { and, asc, eq, isNull, max, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";
import {
  all,
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
import { move } from "../order";

const Service = z.object({
  title: reqText(160, "Title"),
  slug,
  summary: reqText(1000, "Summary"),
  body: optText(20000),
  imageId: uuidOpt,
  pageId: uuidOpt,
  parentId: uuidOpt,
  status,
});

const siblingsOf = (parentId: string | null) =>
  parentId ? eq(s.services.parentId, parentId) : isNull(s.services.parentId);

export async function saveService(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const raw = fields(form, Object.keys(Service.shape));
  raw.slug ??= raw.title ? slugify(raw.title) : undefined;
  const r = Service.safeParse(raw);
  if (!r.success) return { error: firstError(r.error) };
  if (id && r.data.parentId === id) return { error: "A service can't be its own parent." };
  const t = s.services;
  const [clash] = await db()
    .select({ id: t.id })
    .from(t)
    .where(id ? and(eq(t.slug, r.data.slug), ne(t.id, id)) : eq(t.slug, r.data.slug))
    .limit(1);
  if (clash) return { error: `Another service already uses the slug “${r.data.slug}”.` };

  const titles = all(form, "featureTitle");
  const descs = all(form, "featureDescription");
  const features = titles
    .map((title, i) => ({ title, description: descs[i] || null }))
    .filter((f) => f.title || f.description);
  if (features.some((f) => !f.title)) return { error: "Each feature needs a title." };

  const v = {
    ...r.data,
    body: r.data.body ?? null,
    imageId: r.data.imageId ?? null,
    pageId: r.data.pageId ?? null,
    parentId: r.data.parentId ?? null,
  };
  const savedId = await db().transaction(async (tx) => {
    let sid = id;
    if (sid) {
      await tx.update(t).set(v).where(eq(t.id, sid));
    } else {
      const [{ n } = { n: null }] = await tx
        .select({ n: max(t.sortOrder) })
        .from(t)
        .where(siblingsOf(v.parentId));
      const [row] = await tx
        .insert(t)
        .values({ ...v, sortOrder: (n ?? -1) + 1 })
        .returning({ id: t.id });
      sid = row?.id ?? null;
    }
    if (!sid) throw new Error("Service was not saved");
    await tx.delete(s.serviceFeatures).where(eq(s.serviceFeatures.serviceId, sid));
    if (features.length) {
      await tx
        .insert(s.serviceFeatures)
        .values(features.map((f, i) => ({ ...f, serviceId: sid, sortOrder: i })));
    }
    return sid;
  });
  await audit(me, id ? "update" : "create", "service", savedId);
  revalidatePath("/services");
  if (id) return { saved: true };
  redirect("/services");
}

export async function deleteService(id: string) {
  const me = await requireStaff();
  // Children move up a level rather than disappearing with their parent.
  await db().update(s.services).set({ parentId: null }).where(eq(s.services.parentId, id));
  await db().delete(s.services).where(eq(s.services.id, id));
  await audit(me, "delete", "service", id);
  revalidatePath("/services");
  redirect("/services");
}

export async function moveService(id: string, dir: "up" | "down") {
  const me = await requireStaff();
  const t = s.services;
  const [row] = await db().select({ parentId: t.parentId }).from(t).where(eq(t.id, id)).limit(1);
  if (!row) return;
  const rows = await db()
    .select({ id: t.id })
    .from(t)
    .where(siblingsOf(row.parentId))
    .orderBy(asc(t.sortOrder), asc(t.title));
  if (
    await move(rows, id, dir, (rid, n) => db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)))
  ) {
    await audit(me, "reorder", "service", id, { dir });
  }
  revalidatePath("/services");
}

// ---------- FAQs ----------
const Faq = z.object({
  question: reqText(300, "Question"),
  answer: reqText(5000, "Answer"),
  topic: optText(80),
  status,
});

export async function saveFaq(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const r = Faq.safeParse(fields(form, Object.keys(Faq.shape)));
  if (!r.success) return { error: firstError(r.error) };
  const v = { ...r.data, topic: r.data.topic ?? null };
  const t = s.faqs;
  if (id) {
    await db().update(t).set(v).where(eq(t.id, id));
    await audit(me, "update", "faq", id);
    revalidatePath("/services");
    return { saved: true };
  }
  const [{ n } = { n: null }] = await db()
    .select({ n: max(t.sortOrder) })
    .from(t);
  const [row] = await db()
    .insert(t)
    .values({ ...v, sortOrder: (n ?? -1) + 1 })
    .returning({ id: t.id });
  await audit(me, "create", "faq", row?.id ?? null);
  revalidatePath("/services");
  redirect("/services?tab=faqs");
}

export async function deleteFaq(id: string) {
  const me = await requireStaff();
  await db().delete(s.faqs).where(eq(s.faqs.id, id));
  await audit(me, "delete", "faq", id);
  revalidatePath("/services");
  redirect("/services?tab=faqs");
}

export async function moveFaq(id: string, dir: "up" | "down") {
  const me = await requireStaff();
  const t = s.faqs;
  const rows = await db().select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.question));
  if (
    await move(rows, id, dir, (rid, n) => db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)))
  ) {
    await audit(me, "reorder", "faq", id, { dir });
  }
  revalidatePath("/services");
}
