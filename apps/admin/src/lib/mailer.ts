import "server-only";
import { schema as s } from "@aa/db";
import { type Brand, createMailer } from "@aa/emails";
import { db } from "./db";
import { env } from "./env";

/** Resend, or a logger when RESEND_API_KEY isn't set (local dev). */
export function mailer() {
  const e = env();
  return {
    send: createMailer({ apiKey: e.RESEND_API_KEY, from: e.RESEND_FROM }).send,
    live: Boolean(e.RESEND_API_KEY),
  };
}

export async function brand(): Promise<Brand> {
  const [row] = await db()
    .select({ orgName: s.siteSettings.orgName, address: s.siteSettings.address })
    .from(s.siteSettings)
    .limit(1);
  return {
    orgName: row?.orgName ?? "African Aspirations",
    address: row?.address,
    siteUrl: env().SITE_URL,
  };
}
