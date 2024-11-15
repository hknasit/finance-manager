import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Constants for configuration
const BASE_PATH = '/projects/mymoney';
const PUBLIC_PATHS = [
  `${BASE_PATH}/login`,
  `${BASE_PATH}/register`,
  `${BASE_PATH}/forgot-password`,
  `${BASE_PATH}/reset-password`,
  `${BASE_PATH}/`,
];

// Helper function to check if path is public
const isPublicPath = (pathname: string) => {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
};

// Helper function to sanitize return URLs
const isSafeReturnUrl = (url: string) => {
  // Only allow relative paths within our app
  return url.startsWith('/') && 
         !url.includes('//') && 
         !url.startsWith('/api/') &&
         !url.startsWith('/_next/');
};

export async function middleware(request: NextRequest) {
  try {
    // Get the pathname with base path consideration
    const pathname = request.nextUrl.pathname;
    
    // Skip middleware for non-relevant paths
    if (!pathname.startsWith(BASE_PATH)) {
      return NextResponse.next();
    }

    // Get auth token from cookies
    const token = request.cookies.get("auth-token");
    
    // Basic token validation (you might want to add actual JWT verification)
    const isValidToken = token?.value && token.value.length > 0;

    // Handle public paths
    if (isPublicPath(pathname)) {
      if (isValidToken) {
        // Redirect logged-in users to dashboard
        return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard`, request.url));
      }
      return NextResponse.next();
    }

    // Handle protected paths
    if (!isValidToken) {
      const returnUrl = request.nextUrl.pathname.slice(BASE_PATH.length);
      const loginUrl = new URL(`${BASE_PATH}/login`, request.url);
      
      // Only add safe return URLs
      if (isSafeReturnUrl(returnUrl)) {
        loginUrl.searchParams.set("from", returnUrl);
      }
      
      return NextResponse.redirect(loginUrl);
    }

    // Add security headers to all responses
    const response = NextResponse.next();
    
    // Security headers
    const headers = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };

    // Apply security headers
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, proceed to the requested page
    // You might want to add error monitoring here
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. All static files (images, fonts, etc)
     */
    '/((?!api|_next|_static|.*\\..*$).*)',
  ],
};