import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Objective } from '@/lib/api';

export async function GET() {
    try {
        const objectivesSnapshot = await firestore.collection('objectives').get();
        const objectives = objectivesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Objective, 'id'> }));
        return NextResponse.json(objectives);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const objectiveData: Omit<Objective, 'id'> = await request.json();
        const docRef = await firestore.collection('objectives').add(objectiveData);
        const newObjective = { id: docRef.id, ...objectiveData };
        return NextResponse.json(newObjective, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
