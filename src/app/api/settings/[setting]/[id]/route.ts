import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// UPDATE a setting document
export async function PUT(
    request: Request,
    { params }: { params: { setting: string, id: string } }
) {
    const model = params.setting;
    const id = params.id;
    if (!model || !id) {
        return NextResponse.json({ message: "Setting model or ID not specified" }, { status: 400 });
    }
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }

    try {
        const updatedData = await request.json();
        // Exclude id from the data to be written to avoid conflicts
        const { id: _, ...rest } = updatedData;
        await db.collection(model).doc(id).set(rest, { merge: true });
        const updatedDoc = await db.collection(model).doc(id).get();
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Could not update setting '${id}' in '${model}': ${errorMessage}` }, { status: 500 });
    }
}

// DELETE a setting document
export async function DELETE(
    request: Request,
    { params }: { params: { setting: string, id: string } }
) {
    const model = params.setting;
    const id = params.id;
    if (!model || !id) {
        return NextResponse.json({ message: "Setting model or ID not specified" }, { status: 400 });
    }
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }

    try {
        await db.collection(model).doc(id).delete();
        return NextResponse.json({ message: `Setting '${id}' in '${model}' deleted successfully` }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Could not delete setting '${id}' in '${model}': ${errorMessage}` }, { status: 500 });
    }
}
