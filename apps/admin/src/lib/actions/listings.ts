"use server";
import { schema as s } from "@aa/db";
import { and, asc, eq, max, ne } from "drizzle-orm";
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
import { CURRENCIES } from "../listing-options";
import { move } from "../order";

const money = z
  .string()
  .regex(/^\d{1,12}(\.\d{1,2})?$/, "Amounts: numbers only, e.g. 250000 or 250000.50")
  .optional();

const Listing = z.object({
  name: reqText(160, "Name"),
  slug,
  summary: optText(400),
  description: reqText(30000, "Description"),
  categoryId: uuidOpt,
  location: optText(160),
  region: optText(80),
  price: money,
  currency: z.enum(CURRENCIES).default("USD"),
  sde: money,
  downPayment: money,
  coverId: uuidOpt,
  status,
});

/** Strip thousands separators and currency symbols people paste in. */
const cleanMoney = (v: string | undefined) => v?.replace(/[,\s$€£₵]/g, "") || undefined;

export async function saveListing(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const raw = fields(form, Object.keys(Listing.shape));
  raw.slug ??= raw.name ? slugify(raw.name) : undefined;
  for (const k of ["price", "sde", "downPayment"]) raw[k] = cleanMoney(raw[k]);
  const r = Listing.safeParse(raw);
  if (!r.success) return { error: firstError(r.error) };
  const t = s.listings;
  const [clash] = await db()
    .select({ id: t.id })
    .from(t)
    .where(id ? and(eq(t.slug, r.data.slug), ne(t.id, id)) : eq(t.slug, r.data.slug))
    .limit(1);
  if (clash) return { error: `Another listing already uses the URL /listings/${r.data.slug}.` };
  const gallery = [...new Set(all(form, "galleryIds").filter(Boolean))];
  const v = {
    ...r.data,
    summary: r.data.summary ?? null,
    categoryId: r.data.categoryId ?? null,
    location: r.data.location ?? null,
    region: r.data.region ?? null,
    price: r.data.price ?? null,
    sde: r.data.sde ?? null,
    downPayment: r.data.downPayment ?? null,
    coverId: r.data.coverId ?? null,
    featured: form.get("featured") === "on",
  };
  const savedId = await db().transaction(async (tx) => {
    let lid = id;
    if (lid) await tx.update(t).set(v).where(eq(t.id, lid));
    else lid = (await tx.insert(t).values(v).returning({ id: t.id }))[0]?.id ?? null;
    if (!lid) throw new Error("Listing was not saved");
    await tx.delete(s.listingImages).where(eq(s.listingImages.listingId, lid));
    if (gallery.length) {
      await tx
        .insert(s.listingImages)
        .values(gallery.map((mediaId, i) => ({ listingId: lid, mediaId, sortOrder: i })));
    }
    return lid;
  });
  await audit(me, id ? "update" : "create", "listing", savedId);
  revalidatePath("/listings");
  if (id) return { saved: true };
  redirect("/listings");
}

export async function deleteListing(id: string) {
  const me = await requireStaff();
  // Enquiries keep their history; their listing link becomes empty (FK set null).
  await db().delete(s.listings).where(eq(s.listings.id, id));
  await audit(me, "delete", "listing", id);
  revalidatePath("/listings");
  redirect("/listings");
}

// ---------- categories ----------
const Category = z.object({ label: reqText(80, "Name"), slug, description: optText(400) });

export async function saveCategory(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const raw = fields(form, ["label", "slug", "description"]);
  raw.slug ??= raw.label ? slugify(raw.label) : undefined;
  const r = Category.safeParse(raw);
  if (!r.success) return { error: firstError(r.error) };
  const t = s.listingCategories;
  const [clash] = await db()
    .select({ id: t.id })
    .from(t)
    .where(id ? and(eq(t.slug, r.data.slug), ne(t.id, id)) : eq(t.slug, r.data.slug))
    .limit(1);
  if (clash) return { error: `Another category already uses “${r.data.slug}”.` };
  const v = { ...r.data, description: r.data.description ?? null };
  if (id) {
    await db().update(t).set(v).where(eq(t.id, id));
    await audit(me, "update", "listing_category", id);
  } else {
    const [{ n } = { n: null }] = await db()
      .select({ n: max(t.sortOrder) })
      .from(t);
    const [row] = await db()
      .insert(t)
      .values({ ...v, sortOrder: (n ?? -1) + 1 })
      .returning({ id: t.id });
    await audit(me, "create", "listing_category", row?.id ?? null);
  }
  revalidatePath("/listings");
  return { saved: true };
}

export async function deleteCategory(id: string) {
  const me = await requireStaff();
  await db().delete(s.listingCategories).where(eq(s.listingCategories.id, id)); // listings keep, uncategorised
  await audit(me, "delete", "listing_category", id);
  revalidatePath("/listings");
}

export async function moveCategory(id: string, dir: "up" | "down") {
  const me = await requireStaff();
  const t = s.listingCategories;
  const rows = await db().select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.label));
  if (
    await move(rows, id, dir, (rid, n) => db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)))
  ) {
    await audit(me, "reorder", "listing_category", id, { dir });
  }
  revalidatePath("/listings");
}
