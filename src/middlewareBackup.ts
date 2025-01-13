import { NextResponse } from "next/server";

const BASE_PATH = '/projects/mymoney';
const PUBLIC_PATHS = [
  `/login`,
  `/register`,
  `/forgot-password`,
  `/reset-password`,
  `/verify-email`,
];

const isPublicPath = (pathname) => {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
};

const isSafeReturnUrl = (url) => {
  return url.startsWith('/') && 
         !url.includes('//') && 
         !url.startsWith('/api/') &&
         !url.startsWith('/_next/');
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Remove trailing slash for consistent comparison
  const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  
  const token = request.cookies.get("auth-token");
  const isValidToken = token?.value && token.value.length > 0;

  if (isPublicPath(normalizedPath)) {
    if (isValidToken) {
      return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  if (!isValidToken) {
    const returnUrl = normalizedPath.slice(BASE_PATH.length);
    const loginUrl = new URL(`${BASE_PATH}/login`, request.url);
    
    if (isSafeReturnUrl(returnUrl)) {
      loginUrl.searchParams.set("from", returnUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

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

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Update matcher to be more specific about which paths to include/exclude
export const config = { 
  matcher: [
    // Match all paths under /projects/mymoney except static files and API routes
    '/projects/mymoney/((?!api|_next|_static|.*\\..*).*)',
    '/((?!api|_next|_static|.*\\..*).*)',
    '/',
  ]
};