import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Usa la cookie __session, que es la que pone el login seguro
  const isLoggedIn = request.cookies.has('__session');

  const isPortalRoute = pathname.startsWith('/portal');
  const isAdminRoute =
    !isPortalRoute &&
    pathname !== '/' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup') &&
    pathname !== '/favicon.ico';

  if (!isLoggedIn) {
    if (isPortalRoute) {
      return NextResponse.redirect(new URL('/login?role=employee', request.url));
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/login?role=admin', request.url));
    }
  }

  return NextResponse.next();
}

// Descomenta esto SOLO cuando todo el sistema de login/cookies funcione bien.
// export const config = {
//   matcher: ['/dashboard/:path*', '/portal/:path*'],
// };
