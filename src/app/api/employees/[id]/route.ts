import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET a single employee
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const employee = db.employees.find(e => e.id === params.id);
    if (employee) {
        return NextResponse.json(employee);
    }
    return NextResponse.json({ message: "Employee not found" }, { status: 404 });
}


// UPDATE an employee
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const employeeIndex = db.employees.findIndex(e => e.id === params.id);
    if (employeeIndex !== -1) {
        const updatedData = await request.json();
        // Exclude properties that shouldn't be overwritten from the client
        const { id, avatar, status, ...rest } = updatedData;
        db.employees[employeeIndex] = { ...db.employees[employeeIndex], ...rest };
        return NextResponse.json(db.employees[employeeIndex]);
    }
    return NextResponse.json({ message: "Employee not found" }, { status: 404 });
}

// DELETE an employee
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const employeeIndex = db.employees.findIndex(e => e.id === params.id);
    if (employeeIndex !== -1) {
        const [deletedEmployee] = db.employees.splice(employeeIndex, 1);
        return NextResponse.json(deletedEmployee);
    }
    return NextResponse.json({ message: "Employee not found" }, { status: 404 });
}

// PATCH for specific actions like changing status
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const employeeIndex = db.employees.findIndex(e => e.id === params.id);
    if (employeeIndex !== -1) {
        const { status } = await request.json();
        if (status) {
            db.employees[employeeIndex].status = status;
        }
        return NextResponse.json(db.employees[employeeIndex]);
    }
    return NextResponse.json({ message: "Employee not found" }, { status: 404 });
}
