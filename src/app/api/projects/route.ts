import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Project } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    return NextResponse.json(db.projects);
}

export async function POST(request: Request) {
    const projectData: Omit<Project, 'id'> = await request.json();
    const newProject: Project = {
        ...projectData,
        id: uuidv4(),
    };
    db.projects.push(newProject);
    return NextResponse.json(newProject, { status: 201 });
}
