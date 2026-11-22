import "server-only";
import { z } from "zod";

/** Server-side environment, validated once. A missing variable fails loudly, by name. */
const schema = z.object({
  ADMIN_URL: z.url(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_PRIVATE_KEY: z.string().includes("PRIVATE KEY"),
  DATABASE_URL_ADMIN: z.string().startsWith("postgres"),
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
