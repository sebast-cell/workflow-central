
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Employee } from '@/lib/api';

export async function POST(request: Request) {
    try {
        const { email, password, role } = await request.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // In a real application, you would validate the password against a stored hash.
        // For this demo, we'll just find the user by email.
        const employeesSnapshot = await firestore.collection('employees').where('email', '==', email).limit(1).get();

        if (employeesSnapshot.empty) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const employeeDoc = employeesSnapshot.docs[0];
        const employeeData = { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
        
        // You could add role-based access control here if needed.
        // For example, check if employee.role matches the requested `role`.

        return NextResponse.json(employeeData);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("Login error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
