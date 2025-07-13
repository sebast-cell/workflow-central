
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Employee } from '@/lib/api';

export async function GET() {
    try {
        const employeesSnapshot = await firestore.collection('employees').get();
        const employees = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Employee, 'id'> }));
        return NextResponse.json(employees);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> = await request.json();

        // Stricter validation
        if (!employeeData.name || !employeeData.email) {
            return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
        }

        // Robust avatar generation
        let avatarInitials = 'U'; // Default 'User'
        const nameParts = typeof employeeData.name === 'string' ? employeeData.name.trim().split(' ').filter(Boolean) : [];

        if (nameParts.length > 1) {
            // Two or more words: take first char of first two words
            avatarInitials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
            // One word: take first two chars of that word (if available)
            avatarInitials = nameParts[0].substring(0, 2).toUpperCase();
        }

        const newEmployeeData = {
            ...employeeData,
            status: "Activo",
            avatar: avatarInitials,
        };
        
        const docRef = await firestore.collection('employees').add(newEmployeeData);
        const newEmployee = { id: docRef.id, ...newEmployeeData };
        
        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        // Detailed error logging on the server
        console.error("Error creating employee:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: "Internal server error while creating employee.", details: errorMessage }, { status: 500 });
    }
}
