import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

// PATCH for updating status
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { status } = await request.json();
        if (!status || !['Pendiente', 'Aprobado', 'Rechazado'].includes(status)) {
            return NextResponse.json({ message: "Invalid status provided" }, { status: 400 });
        }

        const docRef = firestore.collection('absenceRequests').doc(params.id);
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
