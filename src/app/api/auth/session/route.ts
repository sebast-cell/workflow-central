import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token no proporcionado' }, { status: 400 });
    }

    // 1. Verificar el ID token con Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid } = decodedToken;

    // 2. Obtener el rol del usuario desde Firestore
    const userDoc = await adminDb.collection('employees').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado en Firestore' }, { status: 404 });
    }
    const { role } = userDoc.data()!;

    // 3. Crear el payload para nuestro propio token de sesión (JWT)
    const payload = {
      uid,
      email: decodedToken.email,
      role, // Incluimos el rol para que el middleware pueda usarlo
    };

    // 4. Crear el token de sesión JWT
    const sessionToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h') // La sesión expira en 1 hora
      .sign(JWT_SECRET);

    // 5. Crear la respuesta JSON que tu página de login espera
    const response = NextResponse.json({ 
      success: true, 
      user: { role } // Devolvemos el rol del usuario
    });

    // 6. Establecer el token como una cookie HttpOnly en la respuesta
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hora en segundos
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en la ruta de sesión:', error);
    return NextResponse.json({ error: 'Autenticación fallida' }, { status: 401 });
  }
}
