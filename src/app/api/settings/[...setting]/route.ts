import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

// This is a generic handler for multiple settings collections.
// E.g. /api/settings/roles will target the 'roles' collection.

export async function GET(
    request: Request,
    { params }: { params: { setting: string[] } }
) {
    const model = params.setting[0];
    if (!model) {
        return NextResponse.json({ message: "Setting model not specified" }, { status: 400 });
    }

    try {
        const snapshot = await firestore.collection(model).get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Could not fetch settings for '${model}': ${errorMessage}` }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { setting: string[] } }
) {
    const model = params.setting[0];
    if (!model) {
        return NextResponse.json({ message: "Setting model not specified" }, { status: 400 });
    }
    
    try {
        const data = await request.json();
        const docRef = await firestore.collection(model).add(data);
        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Could not create setting for '${model}': ${errorMessage}` }, { status: 500 });
    }
}
