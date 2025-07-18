import { NextResponse } from 'next/server';
// Importa 'db' desde tu configuración de Firebase Admin
import { db } from '@/lib/firebase-admin';
// Importa los tipos y funciones necesarios de firebase-admin/firestore
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // <--- ¡CAMBIO AQUÍ! Importa QueryDocumentSnapshot
import type { Incentive } from '@/lib/api'; // Asegúrate de que esta ruta y tipo sean correctos
import { v4 as uuidv4 } from 'uuid'; // Asegúrate de que 'uuid' esté instalado (npm install uuid)

// GET todas las incentivos
export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        // Usa 'db' para acceder a la colección
        const incentivesSnapshot = await db.collection('incentives').get();
        
        // Tipea explícitamente 'doc' en el map para evitar TS7006
        const incentives = incentivesSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
            id: doc.id, 
            ...doc.data() as Omit<Incentive, 'id'> 
        }));
        
        return NextResponse.json(incentives);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/incentives:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// CREATE un nuevo incentivo
export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const incentiveData: Omit<Incentive, 'id' | 'company_id'> = await request.json();
        const newIncentiveData = {
            ...incentiveData,
            company_id: uuidv4(), // Debería venir del contexto del usuario en una app real
        };
        
        // Usa 'db' para acceder a la colección y añadir el documento
        const docRef = await db.collection('incentives').add(newIncentiveData);
        
        const newIncentive = { id: docRef.id, ...newIncentiveData };
        return NextResponse.json(newIncentive, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en POST /api/incentives:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
