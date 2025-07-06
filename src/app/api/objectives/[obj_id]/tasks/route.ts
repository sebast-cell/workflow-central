import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    const obj_id = params.obj_id;
    const tasks = db.tasks.filter(t => t.objective_id === obj_id);
    return NextResponse.json(tasks);
}
