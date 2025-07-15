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
    const { uid, email, name } = decodedToken;

    // 2. Intentar obtener el perfil del usuario desde Firestore
    const userDocRef = adminDb.collection('employees').doc(uid);
    const userDoc = await userDocRef.get();
    
    let userRole = 'Employee'; // Rol por defecto

    if (userDoc.exists) {
      // Si el usuario ya existe, usamos su rol guardado
      userRole = userDoc.data()!.role;
    } else {
      // SI EL USUARIO NO EXISTE, LO CREAMOS AHORA
      console.log(`Usuario no encontrado en Firestore, creando perfil para UID: ${uid}`);
      await userDocRef.set({
        name: name || email, // Usamos el nombre de Google/GitHub o el email
        email: email,
        role: 'Employee', // Asignamos el rol por defecto
        status: 'Active',
        hireDate: new Date(),
      });
      console.log(`Perfil creado con éxito.`);
    }

    // 3. Crear el payload para nuestro propio token de sesión
    const payload = {
      uid,
      email,
      role: userRole,
    };

    // 4. Crear el token de sesión JWT
    const sessionToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    // 5. Crear la respuesta JSON que tu página de login espera
    const response = NextResponse.json({ 
      success: true, 
      user: { role: userRole } 
    });

    // 6. Establecer el token como una cookie HttpOnly
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en la ruta de sesión:', error);
    return NextResponse.json({ error: 'Autenticación fallida' }, { status: 401 });
  }
}
