import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Task } from '@/lib/api';

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    try {
        const obj_id = params.obj_id;
        const tasksSnapshot = await firestore.collection('tasks').where('objective_id', '==', obj_id).get();
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Task, 'id'> }));
        return NextResponse.json(tasks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
