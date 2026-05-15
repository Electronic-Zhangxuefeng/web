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

  // Mentor subdomain — rewrite root to /mentor landing
  if (host === "mentor.wenjin-zhilu.com") {
    if (pathname === "/" || pathname === "/mentor") {
      const url = request.nextUrl.clone();
      url.pathname = "/mentor";
      return NextResponse.rewrite(url);
    }
    // Other paths (/auth, /dashboard, /onboarding, /admin, /call, /api/*) pass through
  } else if (
    pathname === "/mentor" &&
    (host === "www.wenjin-zhilu.com" || host === "wenjin-zhilu.com")
  ) {
    // On main domain, redirect /mentor to mentor subdomain
    const url = request.nextUrl.clone();
    url.hostname = "mentor.wenjin-zhilu.com";
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }

  // Admin subdomain — rewrite root to /admin
  if (host === "admin.wenjin-zhilu.com") {
    if (pathname === "/" || pathname === "/admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    // Other paths pass through (mainly /api/* which is excluded by matcher)
  } else if (
    pathname === "/admin" &&
    (host === "www.wenjin-zhilu.com" || host === "wenjin-zhilu.com")
  ) {
    // On main domain, redirect /admin to admin subdomain
    const url = request.nextUrl.clone();
    url.hostname = "admin.wenjin-zhilu.com";
    url.pathname = "/";
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
