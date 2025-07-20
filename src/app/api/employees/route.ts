import { NextResponse } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Employee } from '@/lib/api';

// GET: Lista todos los empleados
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

// POST: Crea un empleado nuevo (si no existe) o sincroniza si viene de Auth
export async function POST(request: Request) {
    if (!db || !adminAuth) {
        return NextResponse.json({ error: "Firebase Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        // Incluye 'password' y 'uid' como opcionales
        const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> & { password?: string; uid?: string } = await request.json();

        let userRecord;
        if (employeeData.uid) {
            userRecord = await adminAuth.getUser(employeeData.uid);
        } else {
            if (!employeeData.name || !employeeData.email || !employeeData.password) {
                return NextResponse.json({ message: "Nombre, email y contraseña son requeridos para un nuevo usuario." }, { status: 400 });
            }
            userRecord = await adminAuth.createUser({
                email: employeeData.email,
                password: employeeData.password,
                displayName: employeeData.name,
                emailVerified: true,
                disabled: false,
            });
        }

        // Iniciales para avatar
        let avatarInitials = 'U';
        if (employeeData.name && typeof employeeData.name === 'string') {
            const parts = employeeData.name.trim().split(' ').filter(Boolean);
            avatarInitials = parts.map(n => n[0].toUpperCase()).join('').substring(0, 2);
        }

        // Datos a guardar en Firestore
        const firestoreEmployeeData = {
            uid: userRecord.uid,
            name: employeeData.name,
            email: employeeData.email,
            department: employeeData.department || 'Sin Asignar',
            role: employeeData.role || 'Empleado',
            schedule: employeeData.schedule || 'No Definido',
            hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
            phone: employeeData.phone || '',
            status: "Activo",
            avatar: avatarInitials,
        };

        // Crea/actualiza el documento en Firestore
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

        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}
