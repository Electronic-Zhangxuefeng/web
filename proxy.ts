import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

  // Check session by calling the backend
  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/auth");

  if (isProtected || isAuthPage) {
    let isLoggedIn = false;

    try {
      const sessionRes = await fetch(`${apiURL}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (sessionRes.ok) {
        const data = await sessionRes.json();
        isLoggedIn = !!data?.user;
      }
    } catch {
      // If API is unreachable, treat as not logged in
    }

    // Protected routes: redirect to /auth if not logged in
    if (isProtected && !isLoggedIn) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Auth pages: redirect to /dashboard if already logged in
    if (isAuthPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
