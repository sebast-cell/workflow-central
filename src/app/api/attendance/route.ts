
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { AttendanceLog } from '@/lib/api';

// GET all attendance logs
export async function GET() {
    try {
        const attendanceSnapshot = await firestore.collection('attendance').orderBy('timestamp', 'desc').get();
        const logs = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<AttendanceLog, 'id'> }));
        return NextResponse.json(logs);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// CREATE a new attendance log
export async function POST(request: Request) {
    try {
        const logData: Omit<AttendanceLog, 'id'> = await request.json();
        const newLogData = {
            ...logData,
            timestamp: new Date().toISOString(), // Ensure server-side timestamp
        };
        const docRef = await firestore.collection('attendance').add(newLogData);
        const newLog = { id: docRef.id, ...newLogData };
        
        return NextResponse.json(newLog, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
