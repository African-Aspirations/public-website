import "server-only";
import { schema as s } from "@aa/db";
import { count, desc, eq, type SQL } from "drizzle-orm";
import { db } from "./db";

export const SUB_STATUSES = ["confirmed", "pending", "unsubscribed"] as const;
export type SubStatus = (typeof SUB_STATUSES)[number];
export const isSubStatus = (v: unknown): v is SubStatus => SUB_STATUSES.includes(v as SubStatus);

const cols = {
  email: s.newsletterSubscribers.email,
  status: s.newsletterSubscribers.status,
  createdAt: s.newsletterSubscribers.createdAt,
  confirmedAt: s.newsletterSubscribers.confirmedAt,
};
const filter = (status: SubStatus | "all"): SQL | undefined =>
  status === "all" ? undefined : eq(s.newsletterSubscribers.status, status);

export async function listSubscribers(status: SubStatus | "all", page: number, pageSize: number) {
  const where = filter(status);
  const [rows, [total]] = await Promise.all([
    db()
      .select(cols)
      .from(s.newsletterSubscribers)
      .where(where)
      .orderBy(desc(s.newsletterSubscribers.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db().select({ n: count() }).from(s.newsletterSubscribers).where(where),
  ]);
  return { rows, total: total?.n ?? 0 };
}

export async function allSubscribers(status: SubStatus | "all") {
  return db()
    .select(cols)
    .from(s.newsletterSubscribers)
    .where(filter(status))
    .orderBy(desc(s.newsletterSubscribers.createdAt));
}

export async function subscriberCounts() {
  const rows = await db()
    .select({ status: s.newsletterSubscribers.status, n: count() })
    .from(s.newsletterSubscribers)
    .groupBy(s.newsletterSubscribers.status);
  const by = Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<
    Record<SubStatus, number>
  >;
  return { ...by, all: rows.reduce((a, r) => a + r.n, 0) };
}
