import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";

export const GET = async () => {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: { id: session.sub, email: session.email, name: session.name },
  });
};
