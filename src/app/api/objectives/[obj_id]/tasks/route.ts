import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Task } from '@/lib/api';

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const obj_id = params.obj_id;
        const tasksSnapshot = await db.collection('tasks').where('objective_id', '==', obj_id).get();
        
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
