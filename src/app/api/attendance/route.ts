
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { AttendanceLog } from '@/lib/api';

// GET all attendance logs
export async function GET() {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const attendanceSnapshot = await db.collection('attendance').orderBy('timestamp', 'desc').get();
        const logs = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<AttendanceLog, 'id'> }));
        return NextResponse.json(logs);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// CREATE a new attendance log
export async function POST(request: Request) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const logData: Omit<AttendanceLog, 'id'> = await request.json();
        const newLogData = {
            ...logData,
            timestamp: new Date().toISOString(), // Ensure server-side timestamp
        };
        const docRef = await db.collection('attendance').add(newLogData);
        const newLog = { id: docRef.id, ...newLogData };
        
        return NextResponse.json(newLog, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
