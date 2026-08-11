"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-store";

const Login = () => {
  const { onLogin } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const login = await axios.post("/api/auth/login", data);
      const userId = login.data.id ?? login.data._id;
      const userName = login.data.name;

      if (!userId) {
        toast.error("Login succeeded but no user id was returned.");
        return;
      }

      // The server sets an httpOnly session cookie on the response; this
      // local state is only for immediately reflecting the signed-in user
      // in the UI (e.g. the admin sidebar) without a round trip.
      onLogin({ id: userId, name: userName });
      toast.success("Logged in successfully.");
      router.replace("/auth/admin");
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Unable to sign in. Check your email and password.";
      console.error(message, error);
      toast.error(message);
    }
  };

  const submitForm = handleSubmit(onSubmit);

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
      <Toaster position="top-center" richColors closeButton />
      <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative mx-auto w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
        <div className="w-full">
          <div className="text-center">
            <div className="mb-3 inline-flex rounded-full bg-[#f1fbe6] px-3 py-1 font-medium text-[#2f4f1f] text-sm">
              Admin access
            </div>
            <h1 className="font-semibold text-3xl text-gray-900">Sign in</h1>
            <p className="mt-2 text-gray-500">
              Use this page to manage listings, products, and site content.
            </p>
            {isDev ? (
              <p className="mt-3 rounded-lg bg-[#f1fbe6] px-3 py-2 text-[#2f4f1f] text-xs">
                Local dev credentials:{" "}
                <span className="font-medium">
                  admin@africanaspirations.com
                </span>{" "}
                / <span className="font-medium">password123</span>
              </p>
            ) : null}
          </div>
          <div className="mt-5">
            <form onSubmit={submitForm}>
              <div className="relative mt-8">
                <div className="my-4">
                  <input
                    type="email"
                    id="email"
                    {...register("email", { required: "this is reqiured" })}
                    placeholder="Email Address"
                    className="peer mt-1 w-full border-gray-300 border-b-2 py-2.5 placeholder:text-transparent focus:border-gray-500 focus:outline-none"
                    autoComplete="email"
                    required
                  />
                  <span className="mt-2 hidden text-red-400 text-sm"></span>
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform py-1 text-gray-800 text-sm opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-gray-800 peer-focus:text-xs"
                  >
                    Email Address
                  </label>
                  <span className="mt-1 hidden text-red-400 text-xs">
                    Please enter a valid email address.{" "}
                  </span>
                </div>
              </div>
              <div className="relative mt-8">
                <div className="my-4">
                  <input
                    type="password"
                    id="password"
                    {...register("password", {
                      required: "this is reqiured",
                    })}
                    placeholder="Password"
                    className="peer peer mt-1 w-full border-gray-300 border-b-2 py-2.5 placeholder:text-transparent focus:border-gray-500 focus:outline-none"
                    required
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform py-1 text-gray-800 text-sm opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-gray-800 peer-focus:text-xs"
                  >
                    Password
                  </label>
                  <span className="mt-1 hidden text-red-400 text-xs">
                    Password must be at least six characters.{" "}
                  </span>
                </div>
              </div>
              <div className="my-6">
                <Button className="w-full" type="submit">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    ""
                  )}
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
