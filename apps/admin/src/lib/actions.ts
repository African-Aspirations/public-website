"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "./firebase-admin";
import { SESSION_COOKIE } from "./session";
import { isTheme, THEME_COOKIE } from "./theme";

/** Sign out: drop the cookie and revoke the session everywhere. */
export async function signOut() {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE)?.value;
  jar.delete(SESSION_COOKIE);
  if (cookie) {
    try {
      const { uid } = await adminAuth().verifySessionCookie(cookie);
      await adminAuth().revokeRefreshTokens(uid);
    } catch {
      // Already invalid: nothing to revoke.
    }
  }
  redirect("/login");
}

/** Save the appearance preference (Settings → Appearance). */
export async function setTheme(theme: string) {
  if (!isTheme(theme)) return;
  (await cookies()).set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
