import Image from "next/image";
import Link from "next/link";
import { ActionForm, Field } from "@/components/form";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/actions/account";
import logo from "../../../../public/logo.webp";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-card sm:p-8">
        <Image
          src={logo}
          alt="African Aspirations"
          priority
          className="mx-auto h-auto w-32 dark:brightness-0 dark:invert"
        />
        <h1 className="mt-6 text-center text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          We'll email you a link to choose a new one.
        </p>
        <ActionForm
          action={requestPasswordReset}
          submitLabel="Send reset link"
          className="mt-6"
          savedText={null}
        >
          <Field label="Email">
            <Input
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </Field>
        </ActionForm>
        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
