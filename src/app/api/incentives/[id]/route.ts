import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Incentive } from '@/lib/api';

// GET a single incentive
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const doc = await firestore.collection('incentives').doc(params.id).get();
        if (!doc.exists) {
            return NextResponse.json({ message: "Incentive not found" }, { status: 404 });
        }
        return NextResponse.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// UPDATE an incentive
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const updatedData: Partial<Incentive> = await request.json();
        // Exclude properties that shouldn't be overwritten from the client like id
        const { id, company_id, ...rest } = updatedData;
        await firestore.collection('incentives').doc(params.id).update(rest);
        const updatedDoc = await firestore.collection('incentives').doc(params.id).get();
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE an incentive
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await firestore.collection('incentives').doc(params.id).delete();
        return NextResponse.json({ message: "Incentive deleted" }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
