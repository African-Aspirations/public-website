"use client";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MfaSetup } from "@/components/mfa-setup";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import { removeOwnMfa } from "@/lib/actions/account";

/** Settings → Account: authenticator status, setup and removal. */
export function MfaPanel({
  email,
  enrolled,
  required,
}: {
  email: string;
  enrolled: boolean;
  required: boolean;
}) {
  const router = useRouter();
  const [setting, setSetting] = useState(false);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (done)
    return (
      <Alert variant="success">
        Authenticator turned on. Sign in again to use it.
        <form action={signOut} className="mt-2">
          <Button size="sm">Sign in again</Button>
        </form>
      </Alert>
    );
  if (enrolled)
    return (
      <div className="grid gap-3 text-sm">
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden />
          On. You enter a code from your authenticator app when you sign in.
        </p>
        {msg && <Alert>{msg}</Alert>}
        {!required && (
          <Button
            variant="outline"
            size="sm"
            className="justify-self-start"
            disabled={pending}
            onClick={() => {
              if (!confirm("Turn off the authenticator app for your account?")) return;
              start(async () => {
                const r = await removeOwnMfa();
                setMsg(r.error ?? r.message ?? null);
                router.refresh();
              });
            }}
          >
            Turn off
          </Button>
        )}
      </div>
    );
  return setting ? (
    <MfaSetup email={email} onDone={() => setDone(true)} />
  ) : (
    <div className="grid gap-3 text-sm">
      <p className="text-muted-foreground">
        Off. Add an authenticator app so a stolen password isn't enough to get in
        {required ? " (required for super admins)" : ""}.
      </p>
      <Button size="sm" className="justify-self-start" onClick={() => setSetting(true)}>
        Set up authenticator app
      </Button>
    </div>
  );
}
