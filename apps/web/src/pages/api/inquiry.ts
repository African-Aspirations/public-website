import { schema as s } from "@aa/db";
import { inquiryAck, inquiryNotification } from "@aa/emails";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  allowRequest,
  backTo,
  clientIp,
  fields,
  formsDb,
  getBrand,
  getMailer,
  inquirySchema,
  isBot,
  leadsInbox,
  sendSafely,
  siteUrl,
  verifyTurnstile,
} from "../../lib/forms";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  if (isBot(form)) return backTo(ctx, "sent", "/listings");

  const parsed = inquirySchema.safeParse(fields(form));
  if (!parsed.success) return backTo(ctx, "error", "/listings");
  const ip = clientIp(ctx);
  if (!(await verifyTurnstile(form, ip))) return backTo(ctx, "error", "/listings");
  if (!(await allowRequest(ip, "inquiry", 8))) return backTo(ctx, "error", "/listings");

  const { listing: slug, ...lead } = parsed.data;
  // web_forms can only see published listings, so unpublished/unknown slugs are rejected here.
  const [listing] = await formsDb()
    .select({ id: s.listings.id, name: s.listings.name, slug: s.listings.slug })
    .from(s.listings)
    .where(eq(s.listings.slug, slug))
    .limit(1);
  if (!listing) return backTo(ctx, "error", "/listings");

  await formsDb()
    .insert(s.listingInquiries)
    .values({ listingId: listing.id, ...lead });

  const brand = await getBrand();
  const ref = { name: listing.name, url: `${siteUrl()}/listings/${listing.slug}` };
  const mail = getMailer();
  const inbox = leadsInbox();
  if (inbox) {
    await sendSafely("inquiry notification", () =>
      mail.send({ ...inquiryNotification(brand, ref, lead), to: inbox, replyTo: lead.email }),
    );
  }
  await sendSafely("inquiry ack", () =>
    mail.send({ ...inquiryAck(brand, ref, lead), to: lead.email }),
  );
  return backTo(ctx, "sent", `/listings/${listing.slug}`);
};
