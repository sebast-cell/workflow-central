import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    const obj_id = params.obj_id;
    const obj = db.objectives.find(o => o.id === obj_id);

    if (!obj || !obj.is_incentivized || !obj.incentive_id) {
        return NextResponse.json({ result: 0, message: "Sin incentivo asociado" });
    }

    const incentive = db.incentives.find(i => i.id === obj.incentive_id);
    if (!incentive) {
        return NextResponse.json({ result: 0, message: "Incentivo no encontrado" });
    }

    const tasks = db.tasks.filter(t => t.objective_id === obj_id);
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    if (total === 0) {
        return NextResponse.json({ result: 0, message: "No hay tareas" });
    }

    const ratio = completed / total;
    const value = incentive.type === 'económico' ? parseFloat(incentive.value) : incentive.value;

    if (ratio >= 1) {
        return NextResponse.json({ result: value, message: "Incentivo completo" });
    } else if (ratio >= 0.75) {
        const partialValue = typeof value === 'number' ? value * 0.75 : value;
        return NextResponse.json({ result: partialValue, message: "Incentivo parcial (75%)" });
    } else {
        return NextResponse.json({ result: 0, message: "Incentivo no cumplido" });
    }
}
