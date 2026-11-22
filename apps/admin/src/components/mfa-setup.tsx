"use client";
import { FirebaseError } from "firebase/app";
import {
  multiFactor,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type TotpSecret,
  type User,
} from "firebase/auth";
import QRCode from "qrcode";
import { useState } from "react";
import { Field } from "@/components/form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientAuth } from "@/lib/firebase-client";

/**
 * Authenticator-app setup: confirm the password, scan the QR code, enter a code.
 * Runs in the browser with the Firebase client SDK (enrolment needs a fresh sign-in).
 */
export function MfaSetup({ email, onDone }: { email: string; onDone: () => void }) {
  const [step, setStep] = useState<"password" | "scan">("password");
  const [user, setUser] = useState<User | null>(null);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown) => {
    const code = err instanceof FirebaseError ? err.code : "";
    setError(
      code === "auth/invalid-credential"
        ? "Wrong password."
        : code === "auth/invalid-verification-code"
          ? "That code didn't work. Check the app's clock and try again."
          : code === "auth/operation-not-allowed"
            ? "Authenticator apps aren't enabled for this Firebase project yet."
            : code === "auth/multi-factor-auth-required"
              ? "You already have an authenticator. Remove it first to set up a new one."
              : err instanceof Error
                ? err.message
                : "Something went wrong.",
    );
    setBusy(false);
  };

  async function start(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password")); // read before any await
    setBusy(true);
    setError(null);
    try {
      const auth = await clientAuth();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const session = await multiFactor(cred.user).getSession();
      const s = await TotpMultiFactorGenerator.generateSecret(session);
      setUser(cred.user);
      setSecret(s);
      setQr(
        await QRCode.toDataURL(s.generateQrCodeUrl(email, "African Aspirations Admin"), {
          margin: 1,
          width: 200,
        }),
      );
      setStep("scan");
      setBusy(false);
    } catch (err) {
      fail(err);
    }
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !secret) return;
    const code = String(new FormData(e.currentTarget).get("code") ?? "").replace(/\s/g, "");
    setBusy(true);
    setError(null);
    try {
      await multiFactor(user).enroll(
        TotpMultiFactorGenerator.assertionForEnrollment(secret, code),
        "Authenticator app",
      );
      await signOut(await clientAuth());
      onDone();
    } catch (err) {
      fail(err);
    }
  }

  return step === "password" ? (
    <form onSubmit={start} className="grid max-w-sm gap-3">
      {error && <Alert variant="destructive">{error}</Alert>}
      <Field label="Confirm your password to start">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" disabled={busy} className="justify-self-start">
        {busy ? "Checking…" : "Continue"}
      </Button>
    </form>
  ) : (
    <form onSubmit={verify} className="grid gap-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <ol className="grid list-decimal gap-1 pl-5 text-sm">
        <li>
          Open an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…).
        </li>
        <li>Scan this QR code, or enter the key by hand.</li>
        <li>Type the 6-digit code it shows.</li>
      </ol>
      <div className="flex flex-wrap items-center gap-4">
        {qr && (
          // biome-ignore lint/performance/noImgElement: generated data URL
          <img
            src={qr}
            alt="QR code for your authenticator app"
            width={200}
            height={200}
            className="rounded-lg border bg-white"
          />
        )}
        <div className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Key</span>
          <code className="rounded bg-muted px-2 py-1 font-mono break-all">
            {secret?.secretKey}
          </code>
        </div>
      </div>
      <Field label="Code" className="max-w-48">
        <Input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          className="text-center tracking-[0.3em]"
        />
      </Field>
      <Button type="submit" disabled={busy} className="justify-self-start">
        {busy ? "Checking…" : "Turn on"}
      </Button>
    </form>
  );
}
