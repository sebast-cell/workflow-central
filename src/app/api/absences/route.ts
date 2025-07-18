import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { AbsenceRequest } from '@/lib/api';

// GET all absence requests
export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const snapshot = await db.collection('absenceRequests').orderBy('requestedAt', 'desc').get();
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<AbsenceRequest, 'id'> }));
        return NextResponse.json(requests);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// CREATE a new absence request
export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const requestData: Omit<AbsenceRequest, 'id'| 'requestedAt' | 'status'> = await request.json();
        const newRequestData = {
            ...requestData,
            status: "Pendiente" as const,
            requestedAt: new Date().toISOString(),
        };
        const docRef = await db.collection('absenceRequests').add(newRequestData);
        const newRequest = { id: docRef.id, ...newRequestData };
        
        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
