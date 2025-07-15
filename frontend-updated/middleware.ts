import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const protectedPaths = ["/StudentDashboard"];
  const publicPaths = ["/", "/login"];

  // Normalize pathname (remove trailing slash, lowercase)
  let pathname = request.nextUrl.pathname;
  if (pathname !== "/" && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  pathname = pathname.toLowerCase();

  // If accessing protected page and not logged in, redirect to login
  if (protectedPaths.some((path) => pathname.startsWith(path.toLowerCase()))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If accessing landing or login page and already logged in, redirect to dashboard
  if (publicPaths.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/StudentDashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/StudentDashboard", "/", "/login"],
};
