import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  type SessionPayload,
  verifySessionToken,
} from "@/lib/auth-token";

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Use at the top of any mutating route handler. Returns the verified
 * session on success, or a 401 response to return immediately.
 */
export async function requireSession(): Promise<
  | { session: SessionPayload; response: null }
  | { session: null; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: new NextResponse("Unauthorized", { status: 401 }),
    };
  }
  return { session, response: null };
}
