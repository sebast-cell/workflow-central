import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Objective } from '@/lib/api';

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const objectivesSnapshot = await db.collection('objectives').get();
        const objectives = objectivesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Objective, 'id'> }));
        return NextResponse.json(objectives);
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
        const objectiveData: Omit<Objective, 'id'> = await request.json();
        const docRef = await db.collection('objectives').add(objectiveData);
        const newObjective = { id: docRef.id, ...objectiveData };
        return NextResponse.json(newObjective, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
