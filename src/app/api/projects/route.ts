import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { Project } from '@/lib/api';

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const projectsSnapshot = await db.collection('projects').get();
        const projects = projectsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
            id: doc.id, 
            ...doc.data() as Omit<Project, 'id'> 
        }));
        return NextResponse.json(projects);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en GET /api/projects:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore Admin SDK no inicializado." }, { status: 500 });
    }
    try {
        const projectData: Omit<Project, 'id'> = await request.json();
        const docRef = await db.collection('projects').add(projectData);
        const newProject = { id: docRef.id, ...projectData };
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Error en POST /api/projects:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
