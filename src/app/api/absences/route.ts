import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { AbsenceRequest } from '@/lib/api';

// GET all absence requests
export async function GET() {
    try {
        const snapshot = await firestore.collection('absenceRequests').orderBy('requestedAt', 'desc').get();
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<AbsenceRequest, 'id'> }));
        return NextResponse.json(requests);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// CREATE a new absence request
export async function POST(request: Request) {
    try {
        const requestData: Omit<AbsenceRequest, 'id'| 'requestedAt' | 'status'> = await request.json();
        const newRequestData = {
            ...requestData,
            status: "Pendiente" as const,
            requestedAt: new Date().toISOString(),
        };
        const docRef = await firestore.collection('absenceRequests').add(newRequestData);
        const newRequest = { id: docRef.id, ...newRequestData };
        
        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
