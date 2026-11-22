import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "./env";

/** Firebase Admin SDK: verifies sessions and manages staff accounts. Server only. */
export function adminAuth() {
  const e = env();
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: e.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: e.FIREBASE_CLIENT_EMAIL,
        // Vercel and .env files keep the key's newlines as literal "\n".
        privateKey: e.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  return getAuth(app);
}
