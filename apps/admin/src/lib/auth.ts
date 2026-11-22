import "server-only";
import { schema } from "@aa/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import { adminAuth } from "./firebase-admin";
import { isStaffRole, SESSION_COOKIE, type StaffRole } from "./session";

export type Staff = { uid: string; email: string; name: string | null; role: StaffRole };

/**
 * The signed-in staff member, or null. Verifies the Firebase session cookie
 * (including revocation), the staff_role claim and the staff row (not disabled).
 * Cached per request, so calling it from layout, page and actions costs one check.
 */
export const currentStaff = cache(async (): Promise<Staff | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const claims = await adminAuth().verifySessionCookie(cookie, true);
    if (!isStaffRole(claims.staff_role)) return null;
    const [row] = await db()
      .select({ name: schema.staff.name, disabledAt: schema.staff.disabledAt })
      .from(schema.staff)
      .where(eq(schema.staff.firebaseUid, claims.uid))
      .limit(1);
    if (!row || row.disabledAt) return null;
    return { uid: claims.uid, email: claims.email ?? "", name: row.name, role: claims.staff_role };
  } catch {
    return null;
  }
});

/**
 * Gate for every server component, server action and route handler that touches
 * data. Not signed in → /login. `role: "super_admin"` → admins are sent to the overview.
 */
export async function requireStaff(role?: StaffRole): Promise<Staff> {
  const s = await currentStaff();
  if (!s) redirect("/login");
  if (role === "super_admin" && s.role !== "super_admin") redirect("/?denied=1");
  return s;
}
