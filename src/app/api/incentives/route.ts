import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Incentive } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const incentivesSnapshot = await db.collection('incentives').get();
        const incentives = incentivesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Incentive, 'id'> }));
        return NextResponse.json(incentives);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const incentiveData: Omit<Incentive, 'id' | 'company_id'> = await request.json();
        const newIncentiveData = {
            ...incentiveData,
            company_id: uuidv4(), // Should come from user context in a real app
        };
        const docRef = await db.collection('incentives').add(newIncentiveData);
        const newIncentive = { id: docRef.id, ...newIncentiveData };
        return NextResponse.json(newIncentive, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
