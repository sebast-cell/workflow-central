
'use server'; // Asegúrate de que sea un Server Component/API Route

import { NextResponse } from 'next/server';
// Importa las instancias de auth y db del Admin SDK
// Nota: Estas son las instancias ya inicializadas o null si la inicialización falló.
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin'; // <--- ¡CAMBIO AQUÍ! Importa 'adminDb' también
import { cookies } from 'next/headers';
import type { Employee } from '@/lib/api';

// En el SDK de Admin v10+, las funciones como `doc` y `getDoc` no se importan, se usan como métodos de la instancia de Firestore.
// El código original era `db.collection('...').doc('...')`. No se requieren importaciones adicionales de 'firebase-admin/firestore' para esas operaciones.

async function verifyUserCredentials(email: string): Promise<any | null> {
    if (!adminAuth) {
        throw new Error("Firebase Admin Auth SDK no está inicializado.");
    }
    try {
        const userRecord = await adminAuth.getUserByEmail(email);
        // EN PRODUCCIÓN, NO VERIFICAR LA CONTRASEÑA AQUÍ.
        // ESTO ES SOLO PARA SIMULACIÓN.
        return userRecord;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return null;
        }
        console.error("Error de Firebase Auth al buscar usuario:", error);
        throw error;
    }
}


export async function POST(request: Request) {
    // Asegúrate de que las instancias de autenticación y Firestore del Admin SDK estén disponibles
    if (!adminAuth) {
        console.error("Firebase Admin Auth SDK no inicializado para API de login.");
        return NextResponse.json({ error: "La autenticación del servidor no está inicializada." }, { status: 500 });
    }
    if (!adminDb) { 
        console.error("Firestore Admin SDK no inicializado para API de login.");
        return NextResponse.json({ error: "La base de datos del servidor no está inicializada." }, { status: 500 });
    }
    
    try {
        const body = await request.json();
        // Para este proyecto, seguiremos usando el flujo de email/password que el frontend envía,
        // pero la estructura está lista para manejar un idToken si se implementa en el futuro.
        const { email, password } = body; 

        if (!email || !password) {
            return NextResponse.json({ message: "Se requiere email y contraseña." }, { status: 400 });
        }
        
        // Simulación de verificación de credenciales (INSEGURO PARA PRODUCCIÓN)
        const userRecord = await verifyUserCredentials(email);
        
        if (!userRecord) {
            console.log(`Login fallido para el correo: ${email}. Usuario no encontrado en Firebase Auth.`);
            return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
        }

        // Aquí la lógica de verificación de contraseña es simulada.
        // En una app real, el cliente haría signInWithEmailAndPassword, obtendría un idToken,
        // y lo enviaría aquí.
        // Por ahora, asumimos que si el usuario existe, el login es exitoso.

        // Obtener datos del empleado desde Firestore usando el UID de Auth.
        const employeeDocRef = adminDb.collection('employees').doc(userRecord.uid);
        const employeeDoc = await employeeDocRef.get();

        if (!employeeDoc.exists) {
            console.log(`Login fallido para el correo: ${email}. Usuario encontrado en Auth (UID: ${userRecord.uid}) pero sin perfil en Firestore.`);
            return NextResponse.json({ message: "Perfil de usuario no encontrado." }, { status: 404 });
        }
        
        const employeeData = { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
        
        // Simulación de creación de cookie de sesión (flujo ideal)
        // const idToken = await adminAuth.createCustomToken(userRecord.uid);
        // const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
        // const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        // cookies().set('__session', sessionCookie, { maxAge: expiresIn / 1000, httpOnly: true, secure: true, path: '/' });
        
        // Devolvemos los datos del usuario para que el cliente los gestione (estado y localStorage)
        return NextResponse.json(employeeData);

    } catch (error: any) {
        console.error("Error en la API de Login:", error);
        
        let errorMessage = 'Ocurrió un error desconocido.';
        let statusCode = 500;
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = "Usuario no encontrado.";
            statusCode = 401;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: "Error interno del servidor durante el inicio de sesión.", details: errorMessage }, { status: statusCode });
    }
}
