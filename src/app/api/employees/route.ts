import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Employee } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    // TODO: In a real app, you might want to handle pagination
    return NextResponse.json(db.employees);
}

export async function POST(request: Request) {
    const employeeData: Omit<Employee, 'id' | 'status' | 'avatar'> = await request.json();

    const newEmployee: Employee = {
        id: uuidv4(),
        ...employeeData,
        status: "Activo",
        avatar: employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };
    
    db.employees.push(newEmployee);
    
    return NextResponse.json(newEmployee, { status: 201 });
}
