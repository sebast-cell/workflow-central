import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Employee } from '@/lib/api';

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const employeesSnapshot = await db.collection('employees').get();
        const employees = employeesSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
            id: doc.id, 
            ...doc.data() as Omit<Employee, 'id'> 
        }));
        return NextResponse.json(employees);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/employees:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> & { password?: string; uid?: string } = await request.json();

        // If UID is provided, it means user was created on client, and we just need to create the Firestore doc.
        // Otherwise, we create the user in Auth first.
        let userRecord: admin.auth.UserRecord;

        if (employeeData.uid) {
             userRecord = await admin.auth().getUser(employeeData.uid);
        } else {
             if (!employeeData.name || !employeeData.email || !employeeData.password) {
                return NextResponse.json({ message: "Nombre, correo electrónico y contraseña son requeridos" }, { status: 400 });
            }
             userRecord = await admin.auth().createUser({
                email: employeeData.email,
                password: employeeData.password,
                displayName: employeeData.name,
                emailVerified: true,
                disabled: false,
            });
        }
        
        let avatarInitials = 'U';
        if (employeeData.name && typeof employeeData.name === 'string') {
            const nameParts = employeeData.name.trim().split(' ').filter(Boolean);
            if (nameParts.length >= 2) {
                avatarInitials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else if (nameParts.length === 1 && nameParts[0].length > 0) {
                 avatarInitials = nameParts[0].substring(0, 2).toUpperCase();
                 if (nameParts[0].length === 1) {
                    avatarInitials = nameParts[0][0].toUpperCase();
                 }
            }
        }
        
        const firestoreEmployeeData = {
            name: employeeData.name,
            email: employeeData.email,
            department: employeeData.department || 'Sin Asignar',
            role: employeeData.role || 'Empleado',
            schedule: employeeData.schedule || 'No Definido',
            hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
            phone: employeeData.phone || '',
            status: "Activo",
            avatar: avatarInitials,
            uid: userRecord.uid
        };

        await db.collection('employees').doc(userRecord.uid).set(firestoreEmployeeData);
        
        const newEmployee = { id: userRecord.uid, ...firestoreEmployeeData };
        
        return NextResponse.json(newEmployee, { status: 201 });

    } catch (error: any) {
        console.error("Error al crear empleado:", error);
        
        let errorMessage = 'Ocurrió un error desconocido';
        let statusCode = 500;
        
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'La dirección de correo electrónico ya está en uso por otra cuenta.';
            statusCode = 409;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: "Error interno del servidor al crear empleado.", details: errorMessage }, { status: statusCode });
    }
}
