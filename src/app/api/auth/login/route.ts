'use server';

import { NextResponse } from 'next/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  if (!adminAuth) {
    console.error("Firebase Admin Auth SDK no inicializado para API de login.");
    return NextResponse.json({ error: "Autenticación del servidor no inicializada." }, { status: 500 });
  }

  if (!adminDb) {
    console.error("Firestore Admin SDK no inicializado para API de login.");
    return NextResponse.json({ error: "Base de datos del servidor no inicializada." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
        return NextResponse.json({ message: "Se requiere idToken." }, { status: 400 });
    }
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en ms

    // Verificar el ID Token del cliente para crear una cookie de sesión
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedIdToken.uid;

    const employeeDocRef = adminDb.collection('employees').doc(uid);
    const employeeDoc = await employeeDocRef.get();

    if (!employeeDoc.exists) {
      console.log(`Usuario autenticado (UID: ${uid}) sin perfil en Firestore.`);
      return NextResponse.json({ message: "Perfil de usuario no encontrado." }, { status: 404 });
    }

    const employeeData = { id: employeeDoc.id, ...employeeDoc.data() };

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set({
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // en segundos
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ message: "Inicio de sesión exitoso.", employee: employeeData });

  } catch (error: any) {
    console.error("Error en API de Login:", error);

    let statusCode = 500;
    let errorMessage = "Error interno del servidor.";

    if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
      errorMessage = "Token inválido o expirado.";
      statusCode = 401;
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = "Usuario no encontrado.";
      statusCode = 401;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
