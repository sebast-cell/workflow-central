import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// PATCH for updating status
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const { status } = await request.json();
        if (!status || !['Pendiente', 'Aprobado', 'Rechazado'].includes(status)) {
            return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
        }

        const docRef = db.collection('absenceRequests').doc(params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ message: "Request not found" }, { status: 404 });
        }
        
        await docRef.update({ status });
        const updatedDoc = await docRef.get();
        
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
