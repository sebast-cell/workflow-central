import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Employee } from '@/lib/api';

// GET a single employee
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const doc = await firestore.collection('employees').doc(params.id).get();
        if (!doc.exists) {
            return NextResponse.json({ message: "Employee not found" }, { status: 404 });
        }
        return NextResponse.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// UPDATE an employee
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const updatedData: Partial<Employee> = await request.json();
        // Exclude properties that shouldn't be overwritten from the client like id
        const { id, ...rest } = updatedData;
        await firestore.collection('employees').doc(params.id).update(rest);
        const updatedDoc = await firestore.collection('employees').doc(params.id).get();
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE an employee
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await firestore.collection('employees').doc(params.id).delete();
        return NextResponse.json({ message: "Employee deleted" }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// PATCH for specific actions like changing status
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { status } = await request.json();
        if (status) {
            await firestore.collection('employees').doc(params.id).update({ status });
        }
        const updatedDoc = await firestore.collection('employees').doc(params.id).get();
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
