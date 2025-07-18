import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { isPast } from 'date-fns';
import type { Objective, Incentive, Task } from '@/lib/api';

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }
    try {
        const obj_id = params.obj_id;
        const objDoc = await db.collection('objectives').doc(obj_id).get();

        if (!objDoc.exists) {
            return NextResponse.json({ message: "Objective not found" }, { status: 404 });
        }

        const obj = objDoc.data() as Objective;

        if (!obj.is_incentivized || !obj.incentive_id) {
            return NextResponse.json({ result: 0, message: "Sin incentivo asociado" });
        }

        const isExpired = isPast(new Date(obj.end_date));

        const incentiveDoc = await db.collection('incentives').doc(obj.incentive_id).get();
        if (!incentiveDoc.exists) {
            return NextResponse.json({ result: 0, message: "Incentivo no encontrado" });
        }
        const incentive = incentiveDoc.data() as Incentive;

        const tasksSnapshot = await db.collection('tasks').where('objective_id', '==', obj_id).get();
        const tasks = tasksSnapshot.docs.map(doc => doc.data() as Task);
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;

        if (total === 0) {
            return NextResponse.json({ result: 0, message: "No hay tareas" });
        }

        const ratio = completed / total;

        if (isExpired && ratio < 1) {
            return NextResponse.json({ result: 0, message: "Plazo expirado, no cumplido" });
        }

        const modality = incentive.condition_expression?.modality || 'all-or-nothing';
        const rawValue = incentive.type === 'económico' ? parseFloat(incentive.value) : incentive.value;
        let finalResult: string | number = 0;
        let message = "Incentivo no cumplido";

        if (modality === 'proportional') {
            if (typeof rawValue === 'number') {
                finalResult = rawValue * ratio;
                message = `Proporcional (${(ratio * 100).toFixed(0)}%)`;
            } else {
                if (ratio >= 1) {
                    finalResult = rawValue;
                    message = "Incentivo completo";
                }
            }
        } else { // all-or-nothing
            if (ratio >= 1) {
                finalResult = rawValue;
                message = "Incentivo completo";
            }
        }
        
        return NextResponse.json({ result: finalResult, message });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
