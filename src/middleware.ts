
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.has('auth_token'); // This is a placeholder for a real auth token check

  const isPortalRoute = pathname.startsWith('/portal');
  const isAdminRoute = !isPortalRoute && pathname !== '/' && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/login') && !pathname.startsWith('/signup') && pathname !== '/favicon.ico';
  
  // NOTE: This middleware is NOT currently configured to run as there is no auth.
  // To enable, uncomment the `matcher` export at the bottom.
  // For now, it's a blueprint for when authentication is fully added.

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

// Uncomment this to enable the middleware once a real authentication system is in place.
// export const config = {
//   matcher: ['/dashboard/:path*', '/portal/:path*'],
// };
