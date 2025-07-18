import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin'; // Mantener si necesitas el tipo admin.auth.UserRecord
// Importa los tipos y funciones necesarios de firebase-admin/firestore
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // <--- ¡CAMBIO AQUÍ! Importa QueryDocumentSnapshot
import type { Employee } from '@/lib/api'; // Asegúrate de que esta ruta y tipo sean correctos

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        // Usa 'db' para acceder a la colección 'employees' (PLURAL)
        const employeesSnapshot = await db.collection('employees').get();
        // Tipea explícitamente 'doc' en el map para evitar TS7006
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
        const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> & { password?: string } = await request.json();

        // 1. Validate required fields
        if (!employeeData.name || !employeeData.email || !employeeData.password) {
            return NextResponse.json({ message: "Nombre, correo electrónico y contraseña son requeridos" }, { status: 400 });
        }

        // 2. Create user in Firebase Authentication
        // Asegúrate de que admin.auth() esté disponible
        if (!admin.apps.length) {
            console.error("Firebase Admin SDK no inicializado para admin.auth().");
            return NextResponse.json({ error: "Servicio de autenticación no disponible." }, { status: 500 });
        }
        const userRecord = await admin.auth().createUser({
            email: employeeData.email,
            password: employeeData.password,
            displayName: employeeData.name,
            emailVerified: true, // Marcar como verificado ya que el admin lo está creando
            disabled: false,
        });

        // 3. Generate avatar initials safely and robustly
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
        
        // 4. Prepare data for Firestore document (without password)
        const firestoreEmployeeData = {
            name: employeeData.name,
            email: employeeData.email,
            department: employeeData.department || 'Sin Asignar',
            role: employeeData.role || 'Empleado', // Usar rol del formulario, por defecto Empleado
            schedule: employeeData.schedule || 'No Definido',
            hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
            phone: employeeData.phone || '',
            status: "Activo",
            avatar: avatarInitials,
            uid: userRecord.uid // Almacenar el UID de Firebase Auth
        };

        // 5. Create employee document in Firestore with the UID as the document ID
        // Usa la colección 'employees' (PLURAL)
        await db.collection('employees').doc(userRecord.uid).set(firestoreEmployeeData);
        
        // Usamos el uid de Auth como el ID para el documento de Firestore para consistencia
        const newEmployee = { id: userRecord.uid, ...firestoreEmployeeData };
        
        return NextResponse.json(newEmployee, { status: 201 });

    } catch (error: any) {
        console.error("Error al crear empleado:", error);
        
        let errorMessage = 'Ocurrió un error desconocido';
        let statusCode = 500;
        
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'La dirección de correo electrónico ya está en uso por otra cuenta.';
            statusCode = 409; // Conflicto
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: "Error interno del servidor al crear empleado.", details: errorMessage }, { status: statusCode });
    }
}