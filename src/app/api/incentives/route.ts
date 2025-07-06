import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Incentive } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    return NextResponse.json(db.incentives);
}

export async function POST(request: Request) {
    const incentiveData: Omit<Incentive, 'id' | 'company_id'> = await request.json();
    const newIncentive: Incentive = {
        ...incentiveData,
        id: uuidv4(),
        company_id: uuidv4(), // Should come from user context in a real app
    };
    db.incentives.push(newIncentive);
    return NextResponse.json(newIncentive, { status: 201 });
}
