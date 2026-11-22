/**
 * Create (or promote) a staff account from the command line. Used once to make the
 * first admin; later invites happen from the Staff screen.
 *
 *   cd apps/admin && bun scripts/create-admin.ts you@example.com "Your Name" [super_admin|admin]
 *
 * Reads apps/admin/.env.local. Prints a link to set the password.
 */
import { createDb, schema } from "@aa/db";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { isStaffRole } from "../src/lib/session";

const [email, name, role = "super_admin"] = process.argv.slice(2);
if (!email || !isStaffRole(role)) {
  console.error('Usage: bun scripts/create-admin.ts <email> "<name>" [super_admin|admin]');
  process.exit(1);
}
function need(k: string): string {
  const v = process.env[k];
  if (!v) {
    console.error(`Missing ${k} in apps/admin/.env.local`);
    process.exit(1);
  }
  return v;
}

const auth = getAuth(
  initializeApp({
    credential: cert({
      projectId: need("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      clientEmail: need("FIREBASE_CLIENT_EMAIL"),
      privateKey: need("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  }),
);

const user = await auth
  .getUserByEmail(email)
  .catch(() => auth.createUser({ email, displayName: name }));
await auth.setCustomUserClaims(user.uid, { staff_role: role });

const db = createDb(need("DATABASE_URL_ADMIN"));
await db
  .insert(schema.staff)
  .values({ firebaseUid: user.uid, email, name: name ?? null, role })
  .onConflictDoUpdate({
    target: schema.staff.firebaseUid,
    set: { email, name: name ?? null, role, disabledAt: null },
  });

const link = await auth.generatePasswordResetLink(email);
console.log(`\n✓ ${email} is now ${role === "super_admin" ? "a super admin" : "an admin"}.`);
console.log(`\nOpen this link to set the password (valid about 1 hour):\n${link}\n`);
process.exit(0);
