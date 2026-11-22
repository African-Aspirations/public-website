"use server";
import { schema as s } from "@aa/db";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";

const MIN_GAP_MS = 60_000; // one build at a time is plenty

/** Rebuild the public site from the database (Vercel deploy hook). */
export async function publishSite(): Promise<{ ok?: true; error?: string }> {
  const me = await requireStaff();
  const hook = process.env.PUBLISH_HOOK_URL;
  if (!hook) return { error: "Publishing isn't set up yet (PUBLISH_HOOK_URL)." };
  const [last] = await db()
    .select({ at: s.auditLog.at })
    .from(s.auditLog)
    .where(eq(s.auditLog.action, "publish"))
    .orderBy(desc(s.auditLog.at))
    .limit(1);
  if (last && Date.now() - last.at.getTime() < MIN_GAP_MS) {
    return { error: "A publish just started. Wait a minute before publishing again." };
  }
  const res = await fetch(hook, { method: "POST" }).catch(() => null);
  if (!res?.ok)
    return { error: `Vercel didn't accept the publish (${res?.status ?? "network error"}).` };
  const job = (await res.json().catch(() => ({}))) as { job?: { id?: string } };
  await audit(me, "publish", "site", null, { job: job.job?.id ?? null });
  revalidatePath("/", "layout");
  return { ok: true };
}
