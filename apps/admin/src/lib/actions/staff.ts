"use server";
import { schema as s } from "@aa/db";
import { staffInvite } from "@aa/emails";
import { and, count, eq, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";
import { env } from "../env";
import { adminAuth } from "../firebase-admin";
import { type FormState, fields, firstError, optText } from "../form-data";
import { brand, mailer } from "../mailer";
import { isStaffRole, type StaffRole } from "../session";

const ROLE_LABEL: Record<StaffRole, string> = { super_admin: "Super admin", admin: "Admin" };

const Invite = z.object({
  email: z.email("Enter a valid email address").transform((v) => v.toLowerCase()),
  name: optText(120),
  role: z.enum(["super_admin", "admin"]).default("admin"),
});

/** Password-setup link that lands back on the admin's sign-in page. */
async function setupLink(email: string) {
  return adminAuth().generatePasswordResetLink(email, {
    url: `${env().ADMIN_URL}/login?welcome=1`,
  });
}

async function sendInvite(email: string, role: StaffRole, inviter: string) {
  const link = await setupLink(email);
  const m = mailer();
  await m.send({
    ...staffInvite(await brand(), {
      inviterName: inviter,
      signInUrl: link,
      role: ROLE_LABEL[role],
    }),
    to: email,
  });
  return { link, emailed: m.live };
}

/** Super admins only: create the account, give it a role and email a set-password link. */
export async function inviteStaff(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireStaff("super_admin");
  const r = Invite.safeParse(fields(form, ["email", "name", "role"]));
  if (!r.success) return { error: firstError(r.error) };
  const { email, name, role } = r.data;
  const [exists] = await db()
    .select({ id: s.staff.id })
    .from(s.staff)
    .where(eq(s.staff.email, email))
    .limit(1);
  if (exists) return { error: `${email} already has an account. Use “Send invite again” instead.` };
  const auth = adminAuth();
  const user = await auth
    .getUserByEmail(email)
    .catch(() => auth.createUser({ email, displayName: name }));
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, staff_role: role });
  await db()
    .insert(s.staff)
    .values({ firebaseUid: user.uid, email, name: name ?? null, role });
  const { link, emailed } = await sendInvite(email, role, me.name ?? me.email);
  await audit(me, "invite", "staff", user.uid, { email, role });
  revalidatePath("/settings");
  return emailed
    ? { saved: true, message: `Invite sent to ${email}.` }
    : {
        saved: true,
        message: `Account created. Email isn't set up (RESEND_API_KEY), so send ${email} this link yourself:`,
        link,
      };
}

export async function resendInvite(uid: string): Promise<FormState> {
  const me = await requireStaff("super_admin");
  const [row] = await db().select().from(s.staff).where(eq(s.staff.firebaseUid, uid)).limit(1);
  if (!row) return { error: "User not found." };
  const { link, emailed } = await sendInvite(row.email, row.role, me.name ?? me.email);
  await audit(me, "reinvite", "staff", uid);
  return emailed
    ? { message: `Invite sent again to ${row.email}.` }
    : { message: `Send ${row.email} this link:`, link };
}

/** Refuse changes that would leave nobody able to manage users. */
async function guard(me: { uid: string }, uid: string, losesSuper: boolean) {
  if (uid === me.uid) return "You can't change your own access. Ask another super admin.";
  if (!losesSuper) return null;
  const [{ n } = { n: 0 }] = await db()
    .select({ n: count() })
    .from(s.staff)
    .where(
      and(
        eq(s.staff.role, "super_admin"),
        isNull(s.staff.disabledAt),
        ne(s.staff.firebaseUid, uid),
      ),
    );
  return n === 0 ? "There must always be at least one active super admin." : null;
}

export async function setStaffRole(uid: string, role: string): Promise<FormState> {
  const me = await requireStaff("super_admin");
  if (!isStaffRole(role)) return { error: "Unknown role." };
  const [row] = await db().select().from(s.staff).where(eq(s.staff.firebaseUid, uid)).limit(1);
  if (!row || row.role === role) return {};
  const err = await guard(me, uid, row.role === "super_admin");
  if (err) return { error: err };
  const auth = adminAuth();
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...user.customClaims, staff_role: role });
  await auth.revokeRefreshTokens(uid); // their current session ends; the new role applies at next sign-in
  await db().update(s.staff).set({ role }).where(eq(s.staff.firebaseUid, uid));
  await audit(me, "role", "staff", uid, { from: row.role, to: role });
  revalidatePath("/settings");
  return {
    message: `${row.name ?? row.email} is now ${ROLE_LABEL[role].toLowerCase()}. They'll need to sign in again.`,
  };
}

export async function setStaffDisabled(uid: string, disabled: boolean): Promise<FormState> {
  const me = await requireStaff("super_admin");
  const [row] = await db().select().from(s.staff).where(eq(s.staff.firebaseUid, uid)).limit(1);
  if (!row) return { error: "User not found." };
  const err = disabled
    ? await guard(me, uid, row.role === "super_admin")
    : uid === me.uid
      ? "You can't change your own access."
      : null;
  if (err) return { error: err };
  const auth = adminAuth();
  await auth.updateUser(uid, { disabled });
  if (disabled) await auth.revokeRefreshTokens(uid); // signed out everywhere, immediately
  await db()
    .update(s.staff)
    .set({ disabledAt: disabled ? new Date() : null })
    .where(eq(s.staff.firebaseUid, uid));
  await audit(me, disabled ? "disable" : "enable", "staff", uid);
  revalidatePath("/settings");
  return {
    message: `${row.name ?? row.email} ${disabled ? "can no longer sign in" : "can sign in again"}.`,
  };
}

/** Lost phone: remove someone's authenticator so they can set it up again. */
export async function resetStaffMfa(uid: string): Promise<FormState> {
  const me = await requireStaff("super_admin");
  if (uid === me.uid) return { error: "Ask another super admin to reset yours." };
  await adminAuth().updateUser(uid, { multiFactor: { enrolledFactors: null } });
  await adminAuth().revokeRefreshTokens(uid);
  await audit(me, "reset_mfa", "staff", uid);
  revalidatePath("/settings");
  return { message: "Authenticator removed. They'll set up a new one at their next sign-in." };
}
