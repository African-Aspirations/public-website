import "server-only";
import { z } from "zod";

/** Server-side environment, validated once. A missing variable fails loudly, by name. */
const schema = z.object({
  ADMIN_URL: z.url(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_PRIVATE_KEY: z.string().includes("PRIVATE KEY"),
  DATABASE_URL_ADMIN: z.string().startsWith("postgres"),
  // Public site, for "view listing" links. No trailing slash.
  SITE_URL: z.url().default("https://www.africanaspirations.com"),
  // Media library uploads (optional until phase 4 is set up).
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Staff emails (invites, password resets). Without a key, emails are logged instead.
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().default("African Aspirations <admin@mail.africanaspirations.com>"),
  // "true" once TOTP is enabled in Firebase: super admins must use an authenticator app.
  ADMIN_REQUIRE_MFA: z.enum(["true", "false"]).default("false"),
});

let cached: z.infer<typeof schema> | undefined;

export function env() {
  if (cached) return cached;
  const r = schema.safeParse(process.env);
  if (!r.success) {
    const names = r.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `apps/admin: missing or invalid env vars: ${names}. See apps/admin/.env.example.`,
    );
  }
  cached = r.data;
  return cached;
}
