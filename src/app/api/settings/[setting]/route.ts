import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function GET(
    request: Request,
    { params }: { params: { setting: string } }
) {
    const model = params.setting;
    if (!model) {
        return NextResponse.json({ message: "Setting model not specified" }, { status: 400 });
    }
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }

    try {
        const snapshot = await db.collection(model).get();
        const data = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error en GET /api/settings/${model}:`, error);
        return NextResponse.json({ error: `No se pudieron obtener las configuraciones para '${model}': ${errorMessage}` }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { setting: string } }
) {
    const model = params.setting;
    if (!model) {
        return NextResponse.json({ message: "Setting model not specified" }, { status: 400 });
    }
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    
    try {
        const data = await request.json();
        const { id, ...postData } = data;
        const docRef = await db.collection(model).add(postData);
        return NextResponse.json({ id: docRef.id, ...postData }, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error en POST /api/settings/${model}:`, error);
        return NextResponse.json({ error: `No se pudo crear la configuración para '${model}': ${errorMessage}` }, { status: 500 });
    }
}
