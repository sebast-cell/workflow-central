import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Incentive } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const incentivesSnapshot = await firestore.collection('incentives').get();
        const incentives = incentivesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Incentive, 'id'> }));
        return NextResponse.json(incentives);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const incentiveData: Omit<Incentive, 'id' | 'company_id'> = await request.json();
        const newIncentiveData = {
            ...incentiveData,
            company_id: uuidv4(), // Should come from user context in a real app
        };
        const docRef = await firestore.collection('incentives').add(newIncentiveData);
        const newIncentive = { id: docRef.id, ...newIncentiveData };
        return NextResponse.json(newIncentive, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
