import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROUTES = ['/dashboard', '/employees', '/reports', '/settings'];
const EMPLOYEE_ROUTES = ['/portal'];
const PUBLIC_ROUTES = ['/login'];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  let userPayload = null;
  if (sessionCookie) {
    try {
      // Verifica el token de la cookie de sesión
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      userPayload = payload;
    } catch (error) {
      // La cookie es inválida o ha expirado
      console.error('Error al verificar la cookie de sesión:', error);
      // Borra la cookie inválida y redirige al login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // Si el usuario no está autenticado (no hay cookie/payload)
  if (!userPayload) {
    // Y está intentando acceder a una ruta que no es pública, redirigir a login
    if (!PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Si el usuario está autenticado
  const userRole = (userPayload as any).role; // Obtiene el rol del payload del token

  // Si el usuario está en la página de login, redirigir a su página principal
  if (pathname === '/login') {
    const url = userRole === 'Admin' || userRole === 'Owner' ? '/dashboard' : '/portal';
    return NextResponse.redirect(new URL(url, request.url));
  }

  // Lógica de redirección basada en roles
  const isAdmin = userRole === 'Admin' || userRole === 'Owner';
  
  // Si un empleado intenta acceder a una ruta de admin
  if (!isAdmin && ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }
  
  // Si un admin intenta acceder a una ruta de empleado
  if (isAdmin && EMPLOYEE_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si no se cumple ninguna condición de redirección, permite el acceso
  return NextResponse.next();
}

// Configuración para que el middleware se ejecute en todas las rutas excepto las estáticas
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
