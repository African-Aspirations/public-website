import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/session";

/**
 * First line only: no session cookie → /login. The cookie itself is verified on the
 * server by requireStaff() before any data is read.
 */
export function proxy(req: NextRequest) {
  if (!req.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!login|api/session|_next/|fonts/|favicon.ico|robots.txt).*)"],
};
