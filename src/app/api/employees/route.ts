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
        const newEmployeeData = {
            ...employeeData,
            status: "Activo",
            avatar: employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        };
        
        const docRef = await firestore.collection('employees').add(newEmployeeData);
        const newEmployee = { id: docRef.id, ...newEmployeeData };
        
        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
