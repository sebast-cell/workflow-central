'use server'; // Asegúrate de que sea un Server Action / API Route

import { NextResponse } from 'next/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Importa funciones de Firestore Admin SDK para uso directo si es necesario
// NO necesitas importar `doc` y `getDoc` de `firebase-admin/firestore` aquí.
// Usa `adminDb.collection(...).doc(...)` que ya funciona en el SDK Admin.

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
        const { email, password, idToken } = body;

        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en ms

        if (idToken) {
            // FLUJO SEGURO: El cliente envía un idToken válido (ya autenticado en frontend)
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
                sameSite: 'strict', // 'strict' es más seguro, 'lax' es más compatible con redirecciones
                path: '/',
            });

            return NextResponse.json({ message: "Inicio de sesión exitoso.", employee: employeeData });

        } else if (email && password) {
            // FLUJO SIMULADO (INSEGURO): NO USAR EN PRODUCCIÓN
            // Para producción: Siempre hacer signInWithEmailAndPassword en el cliente.
            const userRecord = await adminAuth.getUserByEmail(email).catch(() => null);

            if (!userRecord) {
                console.log(`Login fallido para el correo: ${email}. Usuario no encontrado en Auth.`);
                return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
            }

            // Simula contraseña correcta solo para pruebas locales
            if (
                (email === 'admin@example.com' && password === 'password123') ||
                (email === 'empleado@example.com' && password === 'password123')
            ) {
                // Esto es una simulación. No crea un idToken real de Firebase.
                // Solo para demostración de flujo.
                const fakeCustomToken = await adminAuth.createCustomToken(userRecord.uid);
                const sessionCookie = await adminAuth.createSessionCookie(fakeCustomToken, { expiresIn });

                cookies().set({
                    name: '__session',
                    value: sessionCookie,
                    maxAge: expiresIn / 1000,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                });

                const userDocRef = adminDb.collection('employees').doc(userRecord.uid);
                const userDoc = await userDocRef.get();
                const role = userDoc.exists ? userDoc.data()?.role || 'Empleado' : 'Empleado';

                return NextResponse.json({ success: true, role });
            } else {
                console.log(`Login fallido: Contraseña incorrecta para ${email}.`);
                return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
            }

        } else {
            return NextResponse.json({ message: "Se requiere idToken o email/password." }, { status: 400 });
        }

    } catch (error: any) {
        // --- ¡CRÍTICO! Mejorar el log de error para Cloud Logging ---
        console.error("Error en la API de Login (detalles):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
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
