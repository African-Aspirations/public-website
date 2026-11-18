import { newsletterConfirm } from "@aa/emails";
import type { APIRoute } from "astro";
import { sql } from "drizzle-orm";
import {
  allowRequest,
  backTo,
  clientIp,
  fields,
  formsDb,
  getBrand,
  getMailer,
  isBot,
  newsletterSchema,
  newToken,
  sendSafely,
  siteUrl,
  verifyTurnstile,
} from "../../lib/forms";

export const prerender = false;

/** Double opt-in: store as pending and email a confirmation link. */
export const POST: APIRoute = async (ctx) => {
  const form = await ctx.request.formData();
  if (isBot(form)) return backTo(ctx, "sent", "/media-and-insights");

  const parsed = newsletterSchema.safeParse(fields(form));
  if (!parsed.success) return backTo(ctx, "error", "/media-and-insights");
  const ip = clientIp(ctx);
  if (!(await verifyTurnstile(form, ip))) return backTo(ctx, "error", "/media-and-insights");
  if (!(await allowRequest(ip, "newsletter", 5)))
    return backTo(ctx, "error", "/media-and-insights");

  const token = newToken();
  const rows = await formsDb().execute<{ r: string }>(
    sql`SELECT newsletter_subscribe(${parsed.data.email}, ${token}) AS r`,
  );
  // Same response whether new or already subscribed, so the form can't be used to probe the list.
  if (rows[0]?.r === "pending") {
    const brand = await getBrand();
    const url = `${siteUrl()}/api/newsletter/confirm?token=${token}`;
    await sendSafely("newsletter confirm", () =>
      getMailer().send({ ...newsletterConfirm(brand, url), to: parsed.data.email }),
    );
  }
  return backTo(ctx, "sent", "/media-and-insights");
};
