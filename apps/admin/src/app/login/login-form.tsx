"use client";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
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
};

/** Firebase password sign-in → ID token → /api/session sets the httpOnly cookie. */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError(null);
    try {
      const auth = await clientAuth();
      const cred = await signInWithEmailAndPassword(
        auth,
        String(f.get("email")),
        String(f.get("password")),
      );
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await cred.user.getIdToken() }),
      });
      await signOut(auth); // the session cookie is the only credential from here on
      if (!res.ok) {
        const { error: msg } = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg ?? "Sign-in failed.");
      }
      // Offer to save the password (Chrome/Edge; others detect the form on their own).
      if ("PasswordCredential" in window) {
        const pc = window.PasswordCredential as unknown as new (f: HTMLFormElement) => Credential;
        await navigator.credentials.store(new pc(form)).catch(() => {});
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof FirebaseError
          ? (MESSAGES[err.code] ?? "Sign-in failed.")
          : err instanceof Error
            ? err.message
            : "Sign-in failed.",
      );
      setBusy(false);
    }
  }

  return (
    <form method="post" onSubmit={onSubmit} className="mt-6 grid gap-4">
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
        Password
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
