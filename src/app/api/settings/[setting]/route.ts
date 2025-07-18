import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
// Importa los tipos y funciones necesarios de firebase-admin/firestore
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // <--- ¡CAMBIO AQUÍ! Importa funciones y tipos

// This is a generic handler for multiple settings collections.
// E.g. /api/settings/roles will target the 'roles' collection.

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
        // Usa 'db' para acceder a la colección dinámicamente
        const snapshot = await db.collection(model).get();
        // Tipea explícitamente 'doc' en el map para evitar TS7006
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
        // Remove id from data if it exists, as Firestore generates it
        const { id, ...postData } = data;
        // Usa 'db' para acceder a la colección y añadir el documento
        const docRef = await db.collection(model).add(postData); // <--- Usa add() en la colección
        return NextResponse.json({ id: docRef.id, ...postData }, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error en POST /api/settings/${model}:`, error);
        return NextResponse.json({ error: `No se pudo crear la configuración para '${model}': ${errorMessage}` }, { status: 500 });
    }
}
