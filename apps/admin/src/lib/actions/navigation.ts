"use server";
import { schema as s } from "@aa/db";
import { and, asc, eq, isNull, max, or } from "drizzle-orm";
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
  optUrl,
  reqText,
  uuidOpt,
} from "../form-data";
import { move } from "../order";

const t = s.navItems;

const Item = z.object({
  label: reqText(80, "Label"),
  description: optText(160),
  menu: reqText(80, "Menu"),
  newColumn: optText(60),
  parentId: uuidOpt,
  pageId: uuidOpt,
  url: optUrl,
});

const siblings = (menu: string, parentId: string | null) =>
  and(eq(t.menu, menu), parentId ? eq(t.parentId, parentId) : isNull(t.parentId));

export async function saveNavItem(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const r = Item.safeParse(fields(form, Object.keys(Item.shape)));
  if (!r.success) return { error: firstError(r.error) };
  const d = r.data;
  const menu = d.menu === "__new" ? (d.newColumn ? `footer:${d.newColumn}` : "") : d.menu;
  if (!menu) return { error: "Name the new footer column." };
  if (!d.pageId === !d.url)
    return { error: "Link to a page or enter a custom link (one of the two)." };
  let parentId = d.parentId ?? null;
  if (parentId) {
    const [p] = await db()
      .select({ menu: t.menu, parentId: t.parentId })
      .from(t)
      .where(eq(t.id, parentId))
      .limit(1);
    if (!p || p.menu !== menu || p.parentId || parentId === id) parentId = null; // one level, same menu
  }
  const v = {
    label: d.label,
    description: d.description ?? null,
    menu,
    parentId,
    pageId: d.pageId ?? null,
    url: d.pageId ? null : (d.url ?? null),
  };
  if (id) {
    const [before] = await db()
      .select({ menu: t.menu, parentId: t.parentId })
      .from(t)
      .where(eq(t.id, id))
      .limit(1);
    const moved = before && (before.menu !== menu || before.parentId !== parentId);
    const sortOrder = moved ? await nextOrder(menu, parentId) : undefined;
    await db()
      .update(t)
      .set({ ...v, ...(sortOrder === undefined ? {} : { sortOrder }) })
      .where(eq(t.id, id));
    // Children follow their parent into another menu.
    if (before && before.menu !== menu)
      await db().update(t).set({ menu }).where(eq(t.parentId, id));
    await audit(me, "update", "nav_item", id);
    revalidatePath("/navigation");
    return { saved: true };
  }
  const [row] = await db()
    .insert(t)
    .values({ ...v, sortOrder: await nextOrder(menu, parentId) })
    .returning({ id: t.id });
  await audit(me, "create", "nav_item", row?.id ?? null);
  revalidatePath("/navigation");
  redirect("/navigation");
}

async function nextOrder(menu: string, parentId: string | null) {
  const [{ n } = { n: null }] = await db()
    .select({ n: max(t.sortOrder) })
    .from(t)
    .where(siblings(menu, parentId));
  return (n ?? -1) + 1;
}

export async function deleteNavItem(id: string) {
  const me = await requireStaff();
  await db()
    .delete(t)
    .where(or(eq(t.id, id), eq(t.parentId, id)));
  await audit(me, "delete", "nav_item", id);
  revalidatePath("/navigation");
  redirect("/navigation");
}

export async function moveNavItem(id: string, dir: "up" | "down") {
  const me = await requireStaff();
  const [row] = await db()
    .select({ menu: t.menu, parentId: t.parentId })
    .from(t)
    .where(eq(t.id, id))
    .limit(1);
  if (!row) return;
  const rows = await db()
    .select({ id: t.id })
    .from(t)
    .where(siblings(row.menu, row.parentId))
    .orderBy(asc(t.sortOrder), asc(t.label));
  if (
    await move(rows, id, dir, (rid, n) => db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)))
  ) {
    await audit(me, "reorder", "nav_item", id, { dir });
  }
  revalidatePath("/navigation");
}

/** Rename a footer column (the heading above its links). */
export async function renameFooterColumn(
  from: string,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > 60) return { error: "Column name: 1–60 characters." };
  await db()
    .update(t)
    .set({ menu: `footer:${name}` })
    .where(eq(t.menu, from));
  await audit(me, "rename", "nav_menu", null, { from, to: `footer:${name}` });
  revalidatePath("/navigation");
  return { saved: true };
}
