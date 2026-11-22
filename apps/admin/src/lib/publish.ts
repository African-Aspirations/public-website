import "server-only";
import { schema as s } from "@aa/db";
import { and, count, desc, eq, gt, inArray } from "drizzle-orm";
import { db } from "./db";

/** Audit-log entities whose changes show up on the public site. */
export const SITE_ENTITIES = [
  "page",
  "page_section",
  "team_member",
  "partner",
  "service",
  "faq",
  "nav_item",
  "nav_menu",
  "media",
  "listing",
  "listing_category",
  "post",
  "site_settings",
  "redirect",
];

export type PublishState = {
  configured: boolean;
  last: { at: Date; by: string } | null;
  pending: number;
};

export async function publishState(): Promise<PublishState> {
  const a = s.auditLog;
  const [last] = await db()
    .select({ at: a.at, by: s.staff.name, email: s.staff.email })
    .from(a)
    .leftJoin(s.staff, eq(s.staff.firebaseUid, a.firebaseUid))
    .where(eq(a.action, "publish"))
    .orderBy(desc(a.at))
    .limit(1);
  const since = inArray(a.entity, SITE_ENTITIES);
  const [p] = await db()
    .select({ n: count() })
    .from(a)
    .where(last ? and(since, gt(a.at, last.at)) : since);
  return {
    configured: Boolean(process.env.PUBLISH_HOOK_URL),
    last: last ? { at: last.at, by: last.by ?? last.email ?? "someone" } : null,
    pending: p?.n ?? 0,
  };
}
