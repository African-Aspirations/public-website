"use client";
import { FirebaseError } from "firebase/app";
import {
  getMultiFactorResolver,
  type MultiFactorError,
  type MultiFactorResolver,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type User,
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientAuth } from "@/lib/firebase-client";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/user-disabled": "This account is disabled.",
  "auth/invalid-verification-code": "That code didn't work. Check the app and try again.",
  "auth/totp-challenge-timeout": "That took too long. Sign in again.",
};

/**
 * Firebase password sign-in → (authenticator code, when the account has one) →
 * ID token → /api/session sets the httpOnly cookie.
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  const fail = (err: unknown) => {
    setError(
      err instanceof FirebaseError
        ? (MESSAGES[err.code] ?? "Sign-in failed.")
        : err instanceof Error
          ? err.message
          : "Sign-in failed.",
    );
    setBusy(false);
  };

  async function finish(user: User, pwForm: HTMLFormElement | null) {
    const auth = await clientAuth();
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: await user.getIdToken() }),
    });
    await signOut(auth); // the session cookie is the only credential from here on
    if (!res.ok) {
      const { error: msg } = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(msg ?? "Sign-in failed.");
    }
    // Offer to save the password (Chrome/Edge; others detect the form on their own).
    if (pwForm && "PasswordCredential" in window) {
      const pc = window.PasswordCredential as unknown as new (f: HTMLFormElement) => Credential;
      await navigator.credentials.store(new pc(pwForm)).catch(() => {});
    }
    router.replace("/");
    router.refresh();
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const f = new FormData(el);
    setBusy(true);
    setError(null);
    try {
      const auth = await clientAuth();
      const cred = await signInWithEmailAndPassword(
        auth,
        String(f.get("email")),
        String(f.get("password")),
      );
      await finish(cred.user, el);
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/multi-factor-auth-required") {
        setResolver(getMultiFactorResolver(await clientAuth(), err as MultiFactorError));
        setForm(el);
        setBusy(false);
        return;
      }
      fail(err);
    }
  }

  async function onCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resolver) return;
    const code = String(new FormData(e.currentTarget).get("code") ?? "").replace(/\s/g, "");
    const hint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
    if (!hint) return fail(new Error("This account's second step isn't an authenticator app."));
    setBusy(true);
    setError(null);
    try {
      const cred = await resolver.resolveSignIn(
        TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code),
      );
      await finish(cred.user, form);
    } catch (err) {
      fail(err);
    }
  }

  if (resolver) {
    return (
      <form onSubmit={onCode} className="mt-6 grid gap-4">
        {error && <Alert variant="destructive">{error}</Alert>}
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
        <Label>
          Code
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            className="text-center text-lg tracking-[0.3em]"
          />
        </Label>
        <Button type="submit" disabled={busy} className="mt-2">
          {busy ? "Checking…" : "Verify"}
        </Button>
        <button
          type="button"
          onClick={() => setResolver(null)}
          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <form method="post" onSubmit={onPassword} className="mt-6 grid gap-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <Label>
        Email
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </Label>
      <Label>
        <span className="flex items-center justify-between">
          Password
          <Link
            href="/login/forgot"
            className="text-xs font-normal text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </span>
        <span className="relative">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            spellCheck={false}
            required
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            aria-controls="password"
            className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center rounded-r-md text-muted-foreground hover:text-foreground"
          >
            {show ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </span>
      </Label>
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
