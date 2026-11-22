"use server";
import { schema as s } from "@aa/db";
import { asc, eq, max } from "drizzle-orm";
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
  optUrl,
  reqText,
  status,
  uuidOpt,
} from "../form-data";
import { move } from "../order";

const Partner = z.object({
  name: reqText(160, "Name"),
  description: optText(10000),
  url: optUrl,
  logoId: uuidOpt,
  status,
});

/** Stats rows from the repeater; rows with both fields empty are dropped. */
function readStats(form: FormData) {
  const values = all(form, "statValue");
  const labels = all(form, "statLabel");
  return values
    .map((value, i) => ({ value, label: labels[i] ?? "" }))
    .filter((r) => r.value || r.label);
}

export async function savePartner(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const r = Partner.safeParse(fields(form, Object.keys(Partner.shape)));
  if (!r.success) return { error: firstError(r.error) };
  const stats = readStats(form);
  if (stats.some((x) => !x.value || !x.label))
    return { error: "Each stat needs both a value and a label." };
  const v = {
    ...r.data,
    description: r.data.description ?? null,
    url: r.data.url ?? null,
    logoId: r.data.logoId ?? null,
    stats,
  };
  const t = s.partners;
  if (id) {
    await db().update(t).set(v).where(eq(t.id, id));
    await audit(me, "update", "partner", id);
    revalidatePath("/partners");
    return { saved: true };
  }
  const [{ n } = { n: null }] = await db()
    .select({ n: max(t.sortOrder) })
    .from(t);
  const [row] = await db()
    .insert(t)
    .values({ ...v, sortOrder: (n ?? -1) + 1 })
    .returning({ id: t.id });
  await audit(me, "create", "partner", row?.id ?? null);
  revalidatePath("/partners");
  redirect("/partners");
}

export async function deletePartner(id: string) {
  const me = await requireStaff();
  await db().delete(s.partners).where(eq(s.partners.id, id));
  await audit(me, "delete", "partner", id);
  revalidatePath("/partners");
  redirect("/partners");
}

export async function movePartner(id: string, dir: "up" | "down") {
  const me = await requireStaff();
  const t = s.partners;
  const rows = await db().select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.name));
  if (
    await move(rows, id, dir, (rid, n) => db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)))
  ) {
    await audit(me, "reorder", "partner", id, { dir });
  }
  revalidatePath("/partners");
}
