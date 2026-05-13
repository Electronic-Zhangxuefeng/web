import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");

  if (host === "wenjin-zhilu.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.wenjin-zhilu.com";
    return NextResponse.redirect(url, 308);
  }

  // Check session by calling the backend
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/call");
  const isAuthPage = pathname.startsWith("/auth");

  if (isProtected || isAuthPage) {
    let isLoggedIn = false;

    try {
      const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
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
      return NextResponse.redirect(new URL("/auth?mode=login", request.url));
    }

    // Auth pages: redirect to /dashboard if already logged in
    if (isAuthPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
