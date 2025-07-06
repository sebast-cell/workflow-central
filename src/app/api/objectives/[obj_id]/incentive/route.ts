import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isPast } from 'date-fns';

export async function GET(
    request: Request,
    { params }: { params: { obj_id: string } }
) {
    const obj_id = params.obj_id;
    const obj = db.objectives.find(o => o.id === obj_id);

    if (!obj || !obj.is_incentivized || !obj.incentive_id) {
        return NextResponse.json({ result: 0, message: "Sin incentivo asociado" });
    }

    // Check if the objective's end date has passed
    const isExpired = isPast(new Date(obj.end_date));

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

    // If expired and not 100% complete, no incentive is awarded
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
            // Proportional doesn't make sense for non-numeric values
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
}
