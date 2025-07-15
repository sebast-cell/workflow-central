import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

const protectedAdminRoutes = ['/dashboard', '/employees', '/reports', '/settings'];
const protectedEmployeeRoutes = ['/portal', '/absences', '/tasks'];
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedAdminRoutes.some(p => path.startsWith(p)) || protectedEmployeeRoutes.some(p => path.startsWith(p));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = request.cookies.get('session')?.value;
  const session = await decrypt(cookie);
  const user = session?.user as { role: string } | null;

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicRoute && user) {
    const redirectUrl = user.role === 'Admin' ? '/dashboard' : '/portal';
    return NextResponse.redirect(new URL(redirectUrl, request.nextUrl));
  }
  
  if (user) {
    if (user.role === 'Admin' && protectedEmployeeRoutes.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }
    if (user.role === 'Employee' && protectedAdminRoutes.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/portal', request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
