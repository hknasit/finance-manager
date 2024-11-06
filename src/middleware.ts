// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
//import { jwtVerify } from 'jose'; // More reliable than jsonwebtoken in edge runtime

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  // Paths that don't require authentication
  const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If trying to access public path while logged in, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access protected path while logged out, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /favicon.ico, /site.webmanifest, etc.
     */
    "/((?!api|_next|_static|favicon.ico|site.webmanifest).*)",
  ],
};
