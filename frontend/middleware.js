import { NextResponse } from 'next/server';

const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile', '/wishlist'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read auth state from cookie (a simple check using accessToken presence)
  // Full auth is managed client-side via Redux; this is a lightweight server guard
  const hasRefreshToken = request.cookies.has('refreshToken');

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (hasRefreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect user routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!hasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!hasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Note: role check is done client-side via AdminSidebar guard
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
