import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Objective } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    return NextResponse.json(db.objectives);
}

export async function POST(request: Request) {
    const objectiveData: Omit<Objective, 'id'> = await request.json();
    const newObjective: Objective = {
        ...objectiveData,
        id: uuidv4(),
    };
    db.objectives.push(newObjective);
    return NextResponse.json(newObjective, { status: 201 });
}
