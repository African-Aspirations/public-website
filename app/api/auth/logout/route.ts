import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-token";

export const POST = async () => {
  const response = new NextResponse(null, { status: 204 });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
};
