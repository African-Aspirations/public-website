import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-token";
import { db } from "@/utils/turso";

export const POST = async (req: Request, _res: Response) => {
  const { email, password } = await req.json();

  const result = await db.execute({
    sql: "SELECT id, name, email, password FROM users WHERE email = ?",
    args: [email],
  });

  const user = result.rows[0];

  if (!user) {
    return new NextResponse("Invalid Email or Password", { status: 400 });
  }

  const validPassword = await bcrypt.compare(password, user.password as string);

  if (!validPassword) {
    return new NextResponse("Invalid Email or Password", { status: 400 });
  }

  try {
    const { password: _pw, ...safeUser } = user as Record<string, unknown>;
    const token = await createSessionToken({
      id: user.id as string,
      email: user.email as string,
      name: user.name as string,
    });

    const response = NextResponse.json(safeUser, { status: 200 });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.log("[USER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
