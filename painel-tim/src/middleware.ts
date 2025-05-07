import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './config/routes';

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Temporariamente permitindo acesso direto ao dashboard
  if (pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 