import { NextResponse } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase-admin'; // Importa también auth
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
    if (!db || !adminAuth) { // Verifica ambos
        return NextResponse.json({ error: "Firebase Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        // El tipo ahora incluye `password` y `uid` como opcionales
        const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> & { password?: string; uid?: string } = await request.json();

        let userRecord;
        if (employeeData.uid) {
            // Si el UID ya existe (creado en el cliente), solo lo obtenemos
            userRecord = await adminAuth.getUser(employeeData.uid);
        } else {
            // Si no hay UID, creamos el usuario en Firebase Auth
            if (!employeeData.name || !employeeData.email || !employeeData.password) {
                return NextResponse.json({ message: "Nombre, email y contraseña son requeridos para un nuevo usuario." }, { status: 400 });
            }
            userRecord = await adminAuth.createUser({
                email: employeeData.email,
                password: employeeData.password,
                displayName: employeeData.name,
                emailVerified: true, // Puedes cambiar esto según tu flujo
                disabled: false,
            });
        }
        
        let avatarInitials = 'U';
        if (employeeData.name && typeof employeeData.name === 'string') {
            const nameParts = employeeData.name.trim().split(' ').filter(Boolean);
            if (nameParts.length > 0) {
                avatarInitials = nameParts[0][0].toUpperCase();
                if (nameParts.length > 1) {
                    avatarInitials += nameParts[1][0].toUpperCase();
                }
            }
        }
        
        // Creamos el documento en Firestore con el UID de Auth como ID del documento
        const firestoreEmployeeData = {
            uid: userRecord.uid, // Guardamos el uid también dentro del documento
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

        // Usamos el UID de Auth como ID del documento en Firestore
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
