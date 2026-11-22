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

const Member = z.object({
  name: reqText(120, "Name"),
  role: reqText(160, "Role"),
  credentials: optText(80),
  summary: optText(600),
  bio: optText(20000),
  photoId: uuidOpt,
  linkedinUrl: optUrl,
  status,
});

export async function saveMember(
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const me = await requireStaff();
  const r = Member.safeParse(fields(form, Object.keys(Member.shape)));
  if (!r.success) return { error: firstError(r.error) };
  const v = {
    ...r.data,
    credentials: r.data.credentials ?? null,
    summary: r.data.summary ?? null,
    bio: r.data.bio ?? null,
    photoId: r.data.photoId ?? null,
    linkedinUrl: r.data.linkedinUrl ?? null,
  };
  const t = s.teamMembers;
  if (id) {
    await db().update(t).set(v).where(eq(t.id, id));
    await audit(me, "update", "team_member", id);
    revalidatePath("/team");
    return { saved: true };
  }
  const [{ n } = { n: null }] = await db()
    .select({ n: max(t.sortOrder) })
    .from(t);
  const [row] = await db()
    .insert(t)
    .values({ ...v, sortOrder: (n ?? -1) + 1 })
    .returning({ id: t.id });
  await audit(me, "create", "team_member", row?.id ?? null);
  revalidatePath("/team");
  redirect("/team");
}

export async function deleteMember(id: string) {
  const me = await requireStaff();
  await db().delete(s.teamMembers).where(eq(s.teamMembers.id, id));
  await audit(me, "delete", "team_member", id);
  revalidatePath("/team");
  redirect("/team");
}

export async function moveMember(id: string, dir: "up" | "down") {
  const me = await requireStaff();
  const t = s.teamMembers;
  const rows = await db().select({ id: t.id }).from(t).orderBy(asc(t.sortOrder), asc(t.name));
  if (
    await move(rows, id, dir, (rid, n) => db().update(t).set({ sortOrder: n }).where(eq(t.id, rid)))
  ) {
    await audit(me, "reorder", "team_member", id, { dir });
  }
  revalidatePath("/team");
}
