import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Employee } from '@/lib/api';

// GET: Obtiene un empleado por ID (UID de Firebase Auth)
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const employeeDoc = await db.collection('employees').doc(params.id).get();

        if (!employeeDoc.exists || !employeeDoc.data()) {
            return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
        }

        return NextResponse.json({ id: employeeDoc.id, ...employeeDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// PUT: Actualiza un empleado por ID
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const updatedData: Partial<Employee> = await request.json();
        const { id, ...rest } = updatedData; // nunca actualices el id

        const employeeDocRef = db.collection('employees').doc(params.id);
        await employeeDocRef.update(rest);

        const updatedDoc = await employeeDocRef.get();

        if (!updatedDoc.data()) {
            return NextResponse.json({ message: "Datos de empleado actualizados no encontrados" }, { status: 500 });
        }

        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en PUT /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE: Elimina un empleado por ID
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        await db.collection('employees').doc(params.id).delete();
        return NextResponse.json({ message: "Empleado eliminado" }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en DELETE /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// PATCH: Actualiza solo el status (u otro campo específico)
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const patchData: Partial<Employee> = await request.json();
        await db.collection('employees').doc(params.id).update(patchData);

        const updatedDoc = await db.collection('employees').doc(params.id).get();

        if (!updatedDoc.data()) {
            return NextResponse.json({ message: "Datos de empleado actualizados no encontrados" }, { status: 500 });
        }

        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en PATCH /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
