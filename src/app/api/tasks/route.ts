import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
// Importa los tipos y funciones necesarios de firebase-admin/firestore
import { QueryDocumentSnapshot } from 'firebase-admin/firestore'; // <--- ¡CAMBIO AQUÍ! Importa QueryDocumentSnapshot
import type { Task } from '@/lib/api'; // Asegúrate de que esta ruta y tipo sean correctos

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const tasksSnapshot = await db.collection('tasks').get();
        // Tipea explícitamente 'doc' en el map para evitar TS7006
        const tasks = tasksSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
            id: doc.id, 
            ...doc.data() as Omit<Task, 'id'> 
        }));
        return NextResponse.json(tasks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/tasks:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const taskData: Omit<Task, 'id'> = await request.json();
        const docRef = await db.collection('tasks').add(taskData);
        const newTask = { id: docRef.id, ...taskData };
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en POST /api/tasks:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
