/**
 * Server-only helpers for the public form endpoints (src/pages/api/*).
 * They run as Vercel functions and connect with the insert-only `web_forms` role.
 *
 * Order of operations for every form:
 *   honeypot → validate → Turnstile → rate limit → save to Postgres → send email.
 * The lead is saved BEFORE email, so an email outage never loses an enquiry.
 */
import { createHash, randomBytes } from "node:crypto";
import { createDb, type Db, schema as s } from "@aa/db";
import { type Brand, createMailer, type Mailer } from "@aa/emails";
import type { APIContext } from "astro";
import { sql } from "drizzle-orm";
import { z } from "zod";

const env = (k: string): string | undefined => import.meta.env[k] ?? process.env[k];

let db: Db | undefined;
export const formsDb = () => {
  db ??= createDb(env("DATABASE_URL_WEB_FORMS"));
  return db;
};

let mailer: Mailer | undefined;
export const getMailer = () => {
  mailer ??= createMailer({
    apiKey: env("RESEND_API_KEY"),
    from: env("RESEND_FROM") ?? "African Aspirations <onboarding@resend.dev>",
  });
  return mailer;
};

export const siteUrl = () => (env("PUBLIC_SITE_URL") ?? "http://localhost:4321").replace(/\/$/, "");
export const leadsInbox = () => env("LEADS_NOTIFY_TO");
export const newsletterSegment = () => env("RESEND_SEGMENT_ID");

export async function getBrand(): Promise<Brand> {
  const [row] = await formsDb()
    .select({ orgName: s.siteSettings.orgName, address: s.siteSettings.address })
    .from(s.siteSettings)
    .limit(1);
  return {
    orgName: row?.orgName ?? "African Aspirations",
    address: row?.address,
    siteUrl: siteUrl(),
  };
}

// ---------- validation ----------
const text = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);
const email = z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(200));

export const contactSchema = z.object({
  name: text(120),
  email,
  phone: optional(40),
  company: optional(160),
  message: text(5000),
});
export const inquirySchema = z.object({
  listing: text(200),
  name: text(120),
  email,
  phone: optional(40),
  message: text(5000),
});
export const newsletterSchema = z.object({ email });

/** FormData → plain object of strings (files ignored). */
export const fields = (form: FormData) =>
  Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) as Record<
    string,
    string
  >;

/** Bots fill the hidden "website" field; humans never see it. */
export const isBot = (form: FormData) => Boolean(String(form.get("website") ?? "").trim());

// ---------- spam & abuse ----------
export function clientIp(ctx: APIContext): string {
  try {
    return ctx.clientAddress;
  } catch {
    return ctx.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  }
}

/** Cloudflare Turnstile. Skipped when no secret is configured (local dev). */
export async function verifyTurnstile(form: FormData, ip: string): Promise<boolean> {
  const secret = env("TURNSTILE_SECRET_KEY");
  if (!secret) return true;
  const token = form.get("cf-turnstile-response");
  if (typeof token !== "string" || !token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

/** Fixed window in Postgres (see migration 0001). IPs are stored only as salted hashes. */
export async function allowRequest(ip: string, route: string, max: number, windowSeconds = 600) {
  const ipHash = createHash("sha256")
    .update(`${env("RATE_LIMIT_SALT") ?? "dev-salt"}:${ip}`)
    .digest("hex");
  const rows = await formsDb().execute<{ ok: boolean }>(
    sql`SELECT rate_limit_hit(${ipHash}, ${route}, ${windowSeconds}, ${max}) AS ok`,
  );
  return rows[0]?.ok === true;
}

export const newToken = () => randomBytes(32).toString("base64url");

// ---------- responses ----------
/** 303 back to the page the form was on (same origin only), with a status fragment. */
export function backTo(ctx: APIContext, status: "sent" | "error", fallback = "/contact") {
  let path = fallback;
  const ref = ctx.request.headers.get("referer");
  if (ref) {
    try {
      const u = new URL(ref);
      if (u.origin === new URL(ctx.request.url).origin) path = u.pathname;
    } catch {
      // ignore malformed referer
    }
  }
  return new Response(null, { status: 303, headers: { Location: `${path}#${status}` } });
}

/** Log and swallow email failures: the lead is already safely stored. */
export async function sendSafely(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    console.error(`[forms] ${label} email failed:`, err);
  }
}
