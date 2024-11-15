import { NextResponse } from "next/server";

const BASE_PATH = '/projects/mymoney';
const PUBLIC_PATHS = [
  `${BASE_PATH}/login`,
  `${BASE_PATH}/register`,
  `${BASE_PATH}/forgot-password`,
  `${BASE_PATH}/reset-password`,
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

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  if (!pathname.startsWith(BASE_PATH)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token");
  const isValidToken = token?.value && token.value.length > 0;

  if (isPublicPath(pathname)) {
    if (isValidToken) {
      return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  if (!isValidToken) {
    const returnUrl = request.nextUrl.pathname.slice(BASE_PATH.length);
    const loginUrl = new URL(`${BASE_PATH}/login`, request.url);

    if (isSafeReturnUrl(returnUrl)) {
      loginUrl.searchParams.set("from", returnUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

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

export const config = {
  matcher: [
    '/projects/mymoney((?!api|_next|_static|.*\\..*$).*)',
  ],
};
