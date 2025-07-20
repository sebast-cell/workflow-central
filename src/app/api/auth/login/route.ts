'use server';

import { NextResponse } from 'next/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { message: 'idToken es requerido.' },
        { status: 400 }
      );
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en ms

    // Verifica el token.
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedIdToken.uid;
    console.log('UID recibido para login:', uid); // <-- ayuda a depurar

    // Crea la cookie de sesión.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    // Busca al empleado.
    const employeeDoc = await adminDb.collection('employees').doc(uid).get();

    if (!employeeDoc.exists) {
      console.log(`Usuario autenticado (UID: ${uid}) sin perfil en Firestore.`);
      return NextResponse.json(
        { message: 'Perfil de usuario no encontrado.' },
        { status: 404 }
      );
    }

    const employeeData = { id: employeeDoc.id, ...employeeDoc.data() };

    // Setea la cookie de sesión.
    cookies().set({
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // segundos
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      employee: employeeData,
    });
  } catch (error: any) {
    console.error(
      'Error en la API de Login:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );

    let statusCode = 500;
    let errorMessage = 'Error interno del servidor.';

    if (
      error.code === 'auth/argument-error' ||
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/id-token-revoked'
    ) {
      errorMessage = 'Token inválido o expirado.';
      statusCode = 401;
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'Usuario no encontrado.';
      statusCode = 401;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
