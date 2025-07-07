import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Project } from '@/lib/api';

export async function GET() {
    try {
        const projectsSnapshot = await firestore.collection('projects').get();
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Project, 'id'> }));
        return NextResponse.json(projects);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const projectData: Omit<Project, 'id'> = await request.json();
        const docRef = await firestore.collection('projects').add(projectData);
        const newProject = { id: docRef.id, ...projectData };
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
