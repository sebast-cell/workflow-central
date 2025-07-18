import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { Task } from '@/lib/api';

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const tasksSnapshot = await db.collection('tasks').get();
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Task, 'id'> }));
        return NextResponse.json(tasks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const taskData: Omit<Task, 'id'> = await request.json();
        const docRef = await db.collection('tasks').add(taskData);
        const newTask = { id: docRef.id, ...taskData };
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
