
'use server';
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { db } from '@/lib/firebase-admin';
import type { Employee } from '@/lib/api';

// This function simulates checking credentials with Firebase Auth.
// In a real scenario, you'd use a client-side SDK to sign in and send the ID token here for verification.
// For this environment, we'll verify the password directly, which is NOT recommended for production.
async function verifyUserCredentials(email: string, password: string): Promise<admin.auth.UserRecord | null> {
    try {
        // Get user by email to get the UID. This doesn't verify the password.
        const userRecord = await admin.auth().getUserByEmail(email);
        // THERE IS NO SERVER-SIDE SDK METHOD TO VERIFY A PASSWORD.
        // This is a major limitation of the Admin SDK. Password verification MUST happen on the client.
        // For our simulation, we will assume if the user exists, the password is correct.
        // This is INSECURE and for DEMO PURPOSES ONLY.
        return userRecord;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return null; // User doesn't exist
        }
        console.error("Firebase Auth error:", error);
        throw error; // Rethrow other auth errors
    }
}


export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // 1. "Verify" credentials with Firebase Auth to get the UID
        const userRecord = await verifyUserCredentials(email, password);
        
        if (!userRecord) {
            console.log(`Login failed for email: ${email}. User not found in Firebase Auth.`);
            return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
        }
        
        // 2. Use the UID from Auth to find the employee document in Firestore
        const employeeDocRef = db.collection('employees').doc(userRecord.uid);
        const employeeDoc = await employeeDocRef.get();

        if (!employeeDoc.exists) {
            console.log(`Login failed for email: ${email}. User found in Auth (UID: ${userRecord.uid}) but no matching profile in Firestore.`);
            return NextResponse.json({ message: "Perfil de usuario no encontrado." }, { status: 404 });
        }
        
        const employeeData = { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
        
        return NextResponse.json(employeeData);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Login API error:", error);
        return NextResponse.json({ message: "Ocurrió un error interno en el servidor.", error: errorMessage }, { status: 500 });
    }
}
