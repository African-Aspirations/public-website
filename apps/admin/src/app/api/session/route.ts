import { schema } from "@aa/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { adminAuth } from "@/lib/firebase-admin";
import { isStaffRole, SESSION_COOKIE, SESSION_DAYS } from "@/lib/session";

const deny = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Only accept requests sent by the admin's own pages. */
function sameOrigin(req: NextRequest) {
  return req.headers.get("origin") === new URL(env().ADMIN_URL).origin;
}

/**
 * POST { idToken }: exchange a fresh Firebase ID token for a 5-day httpOnly session
 * cookie. Only staff (staff_role claim + active staff row) get one.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return deny(403, "Bad origin");
  const body = (await req.json().catch(() => null)) as { idToken?: unknown } | null;
  if (typeof body?.idToken !== "string") return deny(400, "Missing token");

  const auth = adminAuth();
  let decoded: Awaited<ReturnType<typeof auth.verifyIdToken>>;
  try {
    decoded = await auth.verifyIdToken(body.idToken, true);
  } catch {
    return deny(401, "Invalid token");
  }
  // Only a sign-in from the last 5 minutes may start a session.
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return deny(401, "Sign in again");
  if (!isStaffRole(decoded.staff_role)) return deny(403, "Not a staff account");

  const [row] = await db()
    .select({ disabledAt: schema.staff.disabledAt })
    .from(schema.staff)
    .where(eq(schema.staff.firebaseUid, decoded.uid))
    .limit(1);
  if (!row || row.disabledAt) return deny(403, "Not a staff account");

  const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
  const cookie = await auth.createSessionCookie(body.idToken, { expiresIn });
  (await cookies()).set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: expiresIn / 1000,
  });
  return NextResponse.json({ ok: true });
}
