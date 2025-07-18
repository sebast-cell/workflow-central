import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
// Importa los tipos y funciones necesarios de firebase-admin/firestore
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // <--- ¡CAMBIO AQUÍ! Importa QueryDocumentSnapshot
import type { Objective } from '@/lib/api'; // Asegúrate de que esta ruta y tipo sean correctos

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const objectivesSnapshot = await db.collection('objectives').get();
        // Tipea explícitamente 'doc' en el map para evitar TS7006
        const objectives = objectivesSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
            id: doc.id, 
            ...doc.data() as Omit<Objective, 'id'> 
        }));
        return NextResponse.json(objectives);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/objectives:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const objectiveData: Omit<Objective, 'id'> = await request.json();
        const docRef = await db.collection('objectives').add(objectiveData);
        const newObjective = { id: docRef.id, ...objectiveData };
        return NextResponse.json(newObjective, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en POST /api/objectives:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
