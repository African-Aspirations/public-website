import Image from "next/image";
import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/auth";
import logo from "../../../public/logo.webp";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentStaff()) redirect("/");
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-card sm:p-8">
        <Image src={logo} alt="African Aspirations" priority className="mx-auto h-auto w-32" />
        <h1 className="mt-6 text-center text-xl font-semibold">Sign in to the admin</h1>
        <LoginForm />
      </div>
    </main>
  );
}
