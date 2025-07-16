import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROUTES = ['/dashboard', '/employees', '/reports', '/settings'];
const EMPLOYEE_ROUTES = ['/portal'];
// AÑADIMOS LA RUTA RAÍZ ('/') A LAS RUTAS PÚBLICAS
const PUBLIC_ROUTES = ['/', '/login', '/signup']; 

// Función para obtener la clave secreta de forma segura
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno.');
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // --- LÓGICA MEJORADA ---
  // 1. Si NO hay cookie...
  if (!sessionCookie) {
    // Si la ruta a la que intenta acceder no es pública, lo redirigimos a /login.
    if (!PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Si es una ruta pública, le dejamos pasar.
    return NextResponse.next();
  }

  // 2. Si SÍ hay cookie, intentar verificarla
  let userPayload = null;
  try {
    const { payload } = await jwtVerify(sessionCookie, getJwtSecretKey());
    userPayload = payload;
  } catch (error) {
    // Si la verificación falla (token inválido, etc.), borramos la cookie mala y redirigimos a login
    console.error('Fallo al verificar la cookie, borrándola:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // 3. Si la verificación es exitosa y tenemos los datos del usuario
  const userRole = (userPayload as any).role;
  const isAdmin = userRole === 'Admin' || userRole === 'Owner';
  const homeUrl = isAdmin ? '/dashboard' : '/portal';

  // Si un usuario autenticado intenta ir a una ruta pública, lo redirigimos a su panel
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL(homeUrl, request.url));
  }

  // 4. Lógica de redirección por roles
  if (!isAdmin && ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }
  if (isAdmin && EMPLOYEE_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 5. Si todo está en orden, permitir el paso
  return NextResponse.next();
}

// Configuración para que el middleware se ejecute en todas las rutas excepto las estáticas
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
