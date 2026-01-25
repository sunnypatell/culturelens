/**
 * next.js middleware for route protection
 * protects authenticated routes and redirects unauthenticated users
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// routes that require authentication
// NOTE: /results removed for hackathon demo (shows mock data)
const protectedRoutes = ["/dashboard", "/settings", "/profile", "/onboarding"];

// routes that should redirect to dashboard if already authenticated
const authRoutes = ["/auth/login", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // get session cookie (set by firebase auth)
  const session = request.cookies.get("session")?.value;

  // check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // if protected route and no session, redirect to login
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // if auth route and has session, redirect to dashboard
  if (isAuthRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
