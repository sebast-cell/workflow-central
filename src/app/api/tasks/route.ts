import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Task } from '@/lib/api';

export async function GET() {
    try {
        const tasksSnapshot = await firestore.collection('tasks').get();
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Task, 'id'> }));
        return NextResponse.json(tasks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const taskData: Omit<Task, 'id'> = await request.json();
        const docRef = await firestore.collection('tasks').add(taskData);
        const newTask = { id: docRef.id, ...taskData };
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
