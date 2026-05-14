import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSafeLocalRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

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
      const url = new URL("/auth", request.url);
      url.searchParams.set("mode", "login");
      url.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }

    // Auth pages: redirect to the intended local destination if already logged in
    if (isAuthPage && isLoggedIn) {
      const redirectTo = getSafeLocalRedirect(request.nextUrl.searchParams.get("redirect")) || "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
