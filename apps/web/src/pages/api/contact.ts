import { schema as s } from "@aa/db";
import { contactAutoReply, contactNotification } from "@aa/emails";
import type { APIRoute } from "astro";
import {
  allowRequest,
  backTo,
  clientIp,
  contactSchema,
  fields,
  formsDb,
  getBrand,
  getMailer,
  isBot,
  leadsInbox,
  sendSafely,
  verifyTurnstile,
} from "../../lib/forms";

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  if (isBot(form)) return backTo(ctx, "sent"); // pretend success, store nothing

  const parsed = contactSchema.safeParse(fields(form));
  if (!parsed.success) return backTo(ctx, "error");
  const ip = clientIp(ctx);
  if (!(await verifyTurnstile(form, ip))) return backTo(ctx, "error");
  if (!(await allowRequest(ip, "contact", 5))) return backTo(ctx, "error");

  const lead = parsed.data;
  await formsDb().insert(s.contactMessages).values(lead);

  const brand = await getBrand();
  const mail = getMailer();
  const inbox = leadsInbox();
  if (inbox) {
    await sendSafely("contact notification", () =>
      mail.send({ ...contactNotification(brand, lead), to: inbox, replyTo: lead.email }),
    );
  }
  await sendSafely("contact auto-reply", () =>
    mail.send({ ...contactAutoReply(brand, lead), to: lead.email }),
  );
  return backTo(ctx, "sent");
};
