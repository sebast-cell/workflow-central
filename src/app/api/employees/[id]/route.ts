
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Employee } from '@/lib/api';

// GET a single employee
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const employeeDocRef = db.collection('employees').doc(params.id);
        const snapshot = await employeeDocRef.get();

        if (!snapshot.exists) {
            return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
        }
        
        if (!snapshot.data()) {
            return NextResponse.json({ message: "Datos de empleado no encontrados" }, { status: 500 });
        }

        return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// UPDATE an employee
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const updatedData: Partial<Employee> = await request.json();
        const { id, ...rest } = updatedData;
        
        const employeeDocRef = db.collection('employees').doc(params.id);
        await employeeDocRef.update(rest);

        const updatedSnapshot = await employeeDocRef.get();
        
        if (!updatedSnapshot.data()) {
            return NextResponse.json({ message: "Datos de empleado actualizados no encontrados" }, { status: 500 });
        }

        return NextResponse.json({ id: updatedSnapshot.id, ...updatedSnapshot.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en PUT /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE an employee
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

// PATCH for specific actions like changing status
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const { status } = await request.json();
        if (status) {
            await db.collection('employees').doc(params.id).update({ status });
        }
        
        const updatedDocRef = db.collection('employees').doc(params.id);
        const updatedSnapshot = await updatedDocRef.get();
        
        if (!updatedSnapshot.data()) {
            return NextResponse.json({ message: "Datos de empleado actualizados no encontrados" }, { status: 500 });
        }

        return NextResponse.json({ id: updatedSnapshot.id, ...updatedSnapshot.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en PATCH /api/employees/[id]:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
