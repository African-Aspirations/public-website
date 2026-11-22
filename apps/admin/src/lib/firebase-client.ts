"use client";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

/**
 * Firebase in the browser, used only on the login page to turn a password into an
 * ID token. The token is swapped for an httpOnly session cookie straight away, and
 * nothing is kept in browser storage (in-memory persistence).
 */
export async function clientAuth() {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}
