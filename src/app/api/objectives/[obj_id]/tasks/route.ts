import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
// Importa los tipos y funciones necesarios de firebase-admin/firestore
import { collection, where, QueryDocumentSnapshot } from 'firebase-admin/firestore'; // <--- ¡CAMBIO AQUÍ! Importa collection, where, QueryDocumentSnapshot
import type { Task } from '@/lib/api'; // Asegúrate de que esta ruta y tipo sean correctos

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const obj_id = params.obj_id;
        // Usa 'db' para acceder a la colección 'tasks' y aplicar la consulta con where
        const tasksSnapshot = await db.collection('tasks').where('objective_id', '==', obj_id).get();
        
        // Tipea explícitamente 'doc' en el map para evitar TS7006
        const tasks = tasksSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
            id: doc.id, 
            ...doc.data() as Omit<Task, 'id'> 
        }));
        
        return NextResponse.json(tasks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/objectives/[obj_id]/tasks:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}