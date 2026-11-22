import "server-only";
import { schema } from "@aa/db";
import { count, eq } from "drizzle-orm";
import { db } from "./db";

const n = (q: Promise<{ n: number }[]>) => q.then((r) => r[0]?.n ?? 0);

/** New (unhandled) enquiries: listing enquiries and contact-form messages. */
export async function newEnquiries() {
  const d = db();
  const [listings, contact] = await Promise.all([
    n(
      d
        .select({ n: count() })
        .from(schema.listingInquiries)
        .where(eq(schema.listingInquiries.status, "new")),
    ),
    n(
      d
        .select({ n: count() })
        .from(schema.contactMessages)
        .where(eq(schema.contactMessages.status, "new")),
    ),
  ]);
  return { listings, contact, total: listings + contact };
}

export async function overviewCounts() {
  const d = db();
  const [enquiries, subscribers, drafts] = await Promise.all([
    newEnquiries(),
    n(
      d
        .select({ n: count() })
        .from(schema.newsletterSubscribers)
        .where(eq(schema.newsletterSubscribers.status, "confirmed")),
    ),
    n(d.select({ n: count() }).from(schema.pages).where(eq(schema.pages.status, "draft"))),
  ]);
  return { enquiries, subscribers, drafts };
}
