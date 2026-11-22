"use server";
import { type SectionType, schema as s, sectionSchemas } from "@aa/db";
import { and, asc, eq, max, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";
import { type FormState, fields, firstError, optText, reqText, uuidOpt } from "../form-data";
import { move } from "../order";
import { sectionSpec } from "../section-spec";

const PageForm = z.object({
  title: reqText(160, "Title"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
      "URL: lowercase words with dashes, “/” for sub-pages",
    )
    .optional(),
  template: z.enum(["default", "home", "legal", "listings"]).default("default"),
  seoTitle: optText(70),
  seoDescription: optText(170),
  ogImageId: uuidOpt,
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function savePage(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const r = PageForm.safeParse(fields(form, Object.keys(PageForm.shape)));
  if (!r.success) return { error: firstError(r.error) };
  const t = s.pages;
  const [existing] = id ? await db().select().from(t).where(eq(t.id, id)).limit(1) : [];
  // The home page keeps its empty slug; every other page needs one.
  const slug = existing?.template === "home" ? "" : r.data.slug;
  if (slug === undefined) return { error: "URL is required." };
  const [clash] = await db()
    .select({ id: t.id })
    .from(t)
    .where(id ? and(eq(t.slug, slug), ne(t.id, id)) : eq(t.slug, slug))
    .limit(1);
  if (clash) return { error: `Another page already uses /${slug}.` };
  const v = {
    title: r.data.title,
    slug,
    template:
      existing?.template === "home"
        ? "home"
        : r.data.template === "home"
          ? "default"
          : r.data.template,
    seoTitle: r.data.seoTitle ?? null,
    seoDescription: r.data.seoDescription ?? null,
    ogImageId: r.data.ogImageId ?? null,
    noindex: form.get("noindex") === "on",
    status: r.data.status,
  } as const;
  if (id) {
    await db().update(t).set(v).where(eq(t.id, id));
    await audit(me, "update", "page", id);
    revalidatePath("/pages");
    return { saved: true };
  }
  const [row] = await db().insert(t).values(v).returning({ id: t.id });
  await audit(me, "create", "page", row?.id ?? null);
  revalidatePath("/pages");
  redirect(`/pages/${row?.id}`);
}

export async function deletePage(id: string) {
  const me = await requireStaff();
  const [p] = await db()
    .select({ template: s.pages.template })
    .from(s.pages)
    .where(eq(s.pages.id, id))
    .limit(1);
  if (!p || p.template === "home") redirect("/pages");
  await db().delete(s.pages).where(eq(s.pages.id, id)); // sections cascade; nav links become unlinked
  await audit(me, "delete", "page", id);
  revalidatePath("/pages");
  redirect("/pages");
}

// ---------- sections ----------

const isType = (t: string): t is SectionType => t in sectionSchemas;

/** "cards › 2 › title" from a zod issue path, using the editor's labels. */
function where(type: SectionType, path: PropertyKey[]) {
  let fieldsNow = sectionSpec(type);
  const parts: string[] = [];
  for (const p of path) {
    if (typeof p === "number") {
      parts.push(String(p + 1));
      continue;
    }
    const f = fieldsNow.find((x) => x.key === p);
    parts.push(f?.label ?? String(p));
    fieldsNow = f && (f.kind === "list" || f.kind === "object") ? f.fields : [];
  }
  return parts.join(" › ");
}

export async function saveSection(
  pageId: string,
  sectionId: string | null,
  type: string,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  if (!isType(type)) return { error: "Unknown section type." };
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? "{}"));
  } catch {
    return { error: "The form data was malformed." };
  }
  const r = sectionSchemas[type].safeParse(raw);
  if (!r.success) {
    const i = r.error.issues[0];
    if (!i) return { error: "Please check the form." };
    const tooShort = i.code === "too_small" && (i as { origin?: string }).origin === "string";
    const emptyList = i.code === "too_small" && (i as { origin?: string }).origin === "array";
    const msg =
      tooShort || i.code === "invalid_type"
        ? "is required"
        : emptyList
          ? "needs at least one item"
          : i.message;
    return { error: `${where(type, i.path)}: ${msg}` };
  }
  const status = form.get("status") === "draft" ? "draft" : "published";
  const t = s.pageSections;
  if (sectionId) {
    await db()
      .update(t)
      .set({ data: r.data, status })
      .where(and(eq(t.id, sectionId), eq(t.pageId, pageId)));
    await audit(me, "update", "page_section", sectionId, { type });
    revalidatePath(`/pages/${pageId}`);
    return { saved: true };
  }
  const [{ n } = { n: null }] = await db()
    .select({ n: max(t.sortOrder) })
    .from(t)
    .where(eq(t.pageId, pageId));
  const [row] = await db()
    .insert(t)
    .values({ pageId, type, data: r.data, status, sortOrder: (n ?? -1) + 1 })
    .returning({ id: t.id });
  await audit(me, "create", "page_section", row?.id ?? null, { type });
  revalidatePath(`/pages/${pageId}`);
  redirect(`/pages/${pageId}`);
}

export async function deleteSection(pageId: string, sectionId: string) {
  const me = await requireStaff();
  await db()
    .delete(s.pageSections)
    .where(and(eq(s.pageSections.id, sectionId), eq(s.pageSections.pageId, pageId)));
  await audit(me, "delete", "page_section", sectionId);
  revalidatePath(`/pages/${pageId}`);
  redirect(`/pages/${pageId}`);
}

export async function moveSection(pageId: string, sectionId: string, dir: "up" | "down") {
  const me = await requireStaff();
  const t = s.pageSections;
  const rows = await db()
    .select({ id: t.id })
    .from(t)
    .where(eq(t.pageId, pageId))
    .orderBy(asc(t.sortOrder));
  if (
    await move(rows, sectionId, dir, (rid, n) =>
      db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)),
    )
  ) {
    await audit(me, "reorder", "page_section", sectionId, { dir });
  }
  revalidatePath(`/pages/${pageId}`);
}
