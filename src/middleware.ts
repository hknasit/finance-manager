import { NextResponse } from "next/server";

const BASE_PATH = '/projects/mymoney';
const PUBLIC_PATHS = [
  `/`,              // Allow root path
  `/login`,
  `/register`,
  `/forgot-password`,
  `/reset-password`,
  `/verify-email`,
];

// Helper function to check if a path is public
const isPublicPath = (pathname) => {
  // First, normalize the path relative to BASE_PATH
  const relativePath = pathname.startsWith(BASE_PATH) 
    ? pathname.slice(BASE_PATH.length) 
    : pathname;
    
  return PUBLIC_PATHS.some(path => 
    relativePath === path || relativePath === path + '/'
  );
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
  const normalizedPath = pathname === "/"? pathname: pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  console.log(`Middleware: ${normalizedPath}`);
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token");
  const isValidToken = token?.value && token.value.length > 0;

  // Check if it's a public path (including the landing page)
  if (isPublicPath(normalizedPath)) {
    // If user is logged in and tries to access login/register pages, redirect to dashboard
    if (isValidToken && 
        (normalizedPath.includes('/login') || normalizedPath.includes('/register'))) {
      return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!isValidToken) {
    const returnUrl = normalizedPath.startsWith(BASE_PATH) 
      ? normalizedPath.slice(BASE_PATH.length)
      : normalizedPath;
      
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

// Update matcher to be more specific and exclude static files and API routes
export const config = {
  matcher: [
     // Match all paths under /projects/mymoney except static files and API routes
    '/projects/mymoney/((?!api|_next|_static|.*\\..*).*)',
    '/((?!api|_next|_static|.*\\..*).*)',
    '/'
  ],
};