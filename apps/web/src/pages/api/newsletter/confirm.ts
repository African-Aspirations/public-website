import type { APIRoute } from "astro";
import { sql } from "drizzle-orm";
import { formsDb, getMailer, newsletterSegment } from "../../../lib/forms";

export const prerender = false;

const go = (fragment: string) =>
  new Response(null, { status: 303, headers: { Location: `/media-and-insights#${fragment}` } });

/** Link from the confirmation email. Confirms the subscriber and adds them to the Resend segment. */
export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return go("confirm-error");

  const rows = await formsDb().execute<{ email: string | null }>(
    sql`SELECT newsletter_confirm(${token}) AS email`,
  );
  const email = rows[0]?.email;
  if (!email) return go("confirm-error");

  try {
    const contactId = await getMailer().addContact(email, newsletterSegment());
    if (contactId)
      await formsDb().execute(sql`SELECT newsletter_set_resend_id(${email}, ${contactId})`);
  } catch (err) {
    // Confirmed in our DB either way; the admin can re-sync to Resend later.
    console.error("[newsletter] Resend contact sync failed:", err);
  }
  return go("confirmed");
};
