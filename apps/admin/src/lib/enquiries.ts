import "server-only";
import { schema as s } from "@aa/db";
import { count, desc, eq, type SQL } from "drizzle-orm";
import { db } from "./db";

/** Both inboxes share one shape: listing enquiries and contact-form messages. */
export const KINDS = ["listing", "contact"] as const;
export type Kind = (typeof KINDS)[number];
export const isKind = (v: unknown): v is Kind => KINDS.includes(v as Kind);

export const STATUSES = ["new", "contacted", "closed"] as const;
export type Status = (typeof STATUSES)[number];
export const isStatus = (v: unknown): v is Status => STATUSES.includes(v as Status);

export const PAGE_SIZE = 25;

export type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  status: Status;
  createdAt: Date;
  message: string;
  /** Listing name (listing enquiries) or company (contact messages). */
  about: string | null;
};

export type Enquiry = EnquiryRow & {
  phone: string | null;
  company: string | null;
  topic: string | null;
  updatedAt: Date;
  listing: { name: string; slug: string } | null;
};

const UUID = /^[0-9a-f-]{36}$/i;

export async function listEnquiries(kind: Kind, status: Status | "all", page: number) {
  const d = db();
  const offset = (page - 1) * PAGE_SIZE;
  if (kind === "listing") {
    const t = s.listingInquiries;
    const where: SQL | undefined = status === "all" ? undefined : eq(t.status, status);
    const [rows, [total]] = await Promise.all([
      d
        .select({
          id: t.id,
          name: t.name,
          email: t.email,
          status: t.status,
          createdAt: t.createdAt,
          message: t.message,
          about: s.listings.name,
        })
        .from(t)
        .leftJoin(s.listings, eq(s.listings.id, t.listingId))
        .where(where)
        .orderBy(desc(t.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      d.select({ n: count() }).from(t).where(where),
    ]);
    return { rows: rows as EnquiryRow[], total: total?.n ?? 0 };
  }
  const t = s.contactMessages;
  const where: SQL | undefined = status === "all" ? undefined : eq(t.status, status);
  const [rows, [total]] = await Promise.all([
    d
      .select({
        id: t.id,
        name: t.name,
        email: t.email,
        status: t.status,
        createdAt: t.createdAt,
        message: t.message,
        about: t.company,
      })
      .from(t)
      .where(where)
      .orderBy(desc(t.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    d.select({ n: count() }).from(t).where(where),
  ]);
  return { rows: rows as EnquiryRow[], total: total?.n ?? 0 };
}

export async function getEnquiry(kind: Kind, id: string): Promise<Enquiry | null> {
  if (!UUID.test(id)) return null;
  const d = db();
  if (kind === "listing") {
    const t = s.listingInquiries;
    const [r] = await d
      .select({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        status: t.status,
        message: t.message,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        listingName: s.listings.name,
        listingSlug: s.listings.slug,
      })
      .from(t)
      .leftJoin(s.listings, eq(s.listings.id, t.listingId))
      .where(eq(t.id, id))
      .limit(1);
    if (!r) return null;
    const listing =
      r.listingName && r.listingSlug ? { name: r.listingName, slug: r.listingSlug } : null;
    return { ...r, company: null, topic: null, about: r.listingName, listing };
  }
  const t = s.contactMessages;
  const [r] = await d.select().from(t).where(eq(t.id, id)).limit(1);
  return r ? { ...r, about: r.company, listing: null } : null;
}

export async function setStatus(kind: Kind, id: string, status: Status) {
  const t = kind === "listing" ? s.listingInquiries : s.contactMessages;
  const [before] = await db().select({ status: t.status }).from(t).where(eq(t.id, id)).limit(1);
  if (!before || before.status === status) return null;
  await db().update(t).set({ status }).where(eq(t.id, id));
  return before.status;
}
