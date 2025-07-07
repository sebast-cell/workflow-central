import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// A single dynamic route to handle all settings models
// The `setting` param will be an array, e.g., ['roles'] or ['centers']

type DbKey = keyof typeof db;

export async function GET(
    request: Request,
    { params }: { params: { setting: DbKey[] } }
) {
    const model = params.setting[0] as DbKey;
    if (model in db) {
        return NextResponse.json(db[model]);
    }
    return NextResponse.json({ message: `Setting model '${model}' not found` }, { status: 404 });
}


export async function POST(
    request: Request,
    { params }: { params: { setting: DbKey[] } }
) {
    const model = params.setting[0] as DbKey;
    if (model in db) {
        const data = await request.json();
        // This is a generic implementation. In a real app, you'd add validation.
        (db[model] as any[]).push(data);
        return NextResponse.json(data, { status: 201 });
    }
    return NextResponse.json({ message: `Setting model '${model}' not found` }, { status: 404 });
}
