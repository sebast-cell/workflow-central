import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Task } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    return NextResponse.json(db.tasks);
}

export async function POST(request: Request) {
    const taskData: Omit<Task, 'id'> = await request.json();
    const newTask: Task = {
        ...taskData,
        id: uuidv4(),
    };
    db.tasks.push(newTask);
    return NextResponse.json(newTask, { status: 201 });
}
