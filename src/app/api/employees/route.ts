
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import type { Employee } from '@/lib/api';

export async function GET() {
    try {
        const employeesSnapshot = await firestore.collection('employees').get();
        const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Employee, 'id'> }));
        return NextResponse.json(employees);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> & { password?: string } = await request.json();

        // 1. Validate required fields
        if (!employeeData.name || !employeeData.email || !employeeData.password) {
            return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
        }

        // 2. Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: employeeData.email,
            password: employeeData.password,
            displayName: employeeData.name,
            emailVerified: true, // Mark as verified since admin is creating it
            disabled: false,
        });

        // 3. Generate avatar initials safely
        let avatarInitials = 'U';
        if (employeeData.name && typeof employeeData.name === 'string' && employeeData.name.trim().length > 0) {
            const nameParts = employeeData.name.trim().split(' ').filter(Boolean);
            if (nameParts.length > 1) {
                avatarInitials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else if (nameParts.length === 1 && nameParts[0].length > 1) {
                avatarInitials = nameParts[0].substring(0, 2).toUpperCase();
            } else if (nameParts.length === 1) {
                avatarInitials = nameParts[0][0].toUpperCase();
            }
        }
        
        // 4. Prepare data for Firestore document (without password)
        const firestoreEmployeeData = {
            name: employeeData.name,
            email: employeeData.email,
            department: employeeData.department || 'Sin Asignar',
            role: employeeData.role || 'Empleado', // Use role from form, default to Empleado
            schedule: employeeData.schedule || 'No Definido',
            hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
            phone: employeeData.phone || '',
            status: "Activo",
            avatar: avatarInitials,
            uid: userRecord.uid // Store the Firebase Auth UID
        };

        // 5. Create employee document in Firestore with the UID as the document ID
        await firestore.collection('employees').doc(userRecord.uid).set(firestoreEmployeeData);

        // We use the uid from Auth as the ID for the Firestore document for consistency
        const newEmployee = { id: userRecord.uid, ...firestoreEmployeeData };
        
        return NextResponse.json(newEmployee, { status: 201 });

    } catch (error: any) {
        console.error("Error creating employee:", error);
        
        let errorMessage = 'An unknown error occurred';
        let statusCode = 500;
        
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'The email address is already in use by another account.';
            statusCode = 409; // Conflict
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: "Internal server error while creating employee.", details: errorMessage }, { status: statusCode });
    }
}
