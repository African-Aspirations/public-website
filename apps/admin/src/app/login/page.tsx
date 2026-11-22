import Image from "next/image";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { currentStaff } from "@/lib/auth";
import logo from "../../../public/logo.webp";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; changed?: string }>;
}) {
  if (await currentStaff()) redirect("/");
  const q = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-card sm:p-8">
        <Image
          src={logo}
          alt="African Aspirations"
          priority
          className="mx-auto h-auto w-32 dark:brightness-0 dark:invert"
        />
        <h1 className="mt-6 text-center text-xl font-semibold">Sign in to the admin</h1>
        {q.welcome && (
          <Alert variant="success" className="mt-4">
            Your password is set. Sign in to get started.
          </Alert>
        )}
        {q.changed && (
          <Alert variant="success" className="mt-4">
            Password changed. Sign in with your new password.
          </Alert>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
