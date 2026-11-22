"use server";
import { schema as s } from "@aa/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "../audit";
import { requireStaff } from "../auth";
import { db } from "../db";
import { env } from "../env";
import { adminAuth } from "../firebase-admin";
import { type FormState, firstError } from "../form-data";
import { brand, mailer } from "../mailer";
import { SESSION_COOKIE } from "../session";

const Password = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(12, "New password: at least 12 characters").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, "The new passwords don't match")
  .refine((v) => v.next !== v.current, "Choose a password you haven't just used");

/** Checks a password with Firebase without creating a browser session. */
async function passwordIsCorrect(email: string, password: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  const json = (await res.json()) as { idToken?: string; mfaPendingCredential?: string };
  // With an authenticator enrolled, a correct password returns a pending second-factor step.
  return Boolean(json.idToken || json.mfaPendingCredential);
}

/** Change password, then sign out everywhere (including here). */
export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireStaff();
  const r = Password.safeParse({
    current: form.get("current"),
    next: form.get("next"),
    confirm: form.get("confirm"),
  });
  if (!r.success) return { error: firstError(r.error) };
  if (!(await passwordIsCorrect(me.email, r.data.current)))
    return { error: "Your current password is wrong." };
  await adminAuth().updateUser(me.uid, { password: r.data.next });
  await adminAuth().revokeRefreshTokens(me.uid);
  await audit(me, "password", "staff", me.uid);
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login?changed=1");
}

/**
 * "Forgot password": emails a reset link to active staff. Always answers the same way,
 * so it can't be used to find out who has an account.
 */
export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const done = {
    saved: true,
    message: "If that email belongs to a staff account, a reset link is on its way.",
  };
  if (!z.email().safeParse(email).success) return { error: "Enter a valid email address." };
  const [row] = await db().select().from(s.staff).where(eq(s.staff.email, email)).limit(1);
  if (!row || row.disabledAt) return done;
  const link = await adminAuth().generatePasswordResetLink(email, {
    url: `${env().ADMIN_URL}/login`,
  });
  const b = await brand();
  await mailer().send({
    to: email,
    subject: `Reset your password — ${b.orgName} admin`,
    text: `Reset your ${b.orgName} admin password: ${link}\n\nIf you didn't ask for this, ignore this email.`,
    html: `<p>Reset your ${b.orgName} admin password:</p><p><a href="${link}">Choose a new password</a></p><p style="color:#636466;font-size:14px">If you didn't ask for this, ignore this email.</p>`,
  });
  return done;
}

/** Remove your own authenticator (admins only; super admins need one when it's required). */
export async function removeOwnMfa(): Promise<FormState> {
  const me = await requireStaff();
  if (me.role === "super_admin" && env().ADMIN_REQUIRE_MFA === "true") {
    return {
      error:
        "Super admins must keep an authenticator. Set up the new one first, or ask another super admin.",
    };
  }
  await adminAuth().updateUser(me.uid, { multiFactor: { enrolledFactors: null } });
  await audit(me, "remove_mfa", "staff", me.uid);
  return { message: "Authenticator removed." };
}
