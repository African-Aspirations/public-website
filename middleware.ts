import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-token";

const PROTECTED_API_PREFIXES = [
  "/api/products",
  "/api/categories",
  "/api/upload",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/auth/admin");
  const isProtectedApiMutation =
    request.method !== "GET" &&
    PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isAdminPage && !isProtectedApiMutation) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (isProtectedApiMutation) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/upload/:path*",
  ],
};
