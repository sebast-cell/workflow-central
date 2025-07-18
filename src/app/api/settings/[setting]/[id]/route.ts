import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// UPDATE a setting document
export async function PUT(
    request: Request,
    { params }: { params: { setting: string, id: string } }
) {
    const model = params.setting;
    const id = params.id;
    if (!model || !id) {
        return NextResponse.json({ message: "Setting model or ID not specified" }, { status: 400 });
    }
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }

    try {
        const updatedData = await request.json();
        // Exclude id from the data to be written to avoid conflicts
        const { id: _, ...rest } = updatedData;
        
        // Usa set() con { merge: true } para actualizar o crear si no existe
        await db.collection(model).doc(id).set(rest, { merge: true });
        
        const updatedDoc = await db.collection(model).doc(id).get();
        
        if (!updatedDoc.data()) {
            return NextResponse.json({ message: "Datos de configuración actualizados no encontrados" }, { status: 500 });
        }

        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error en PUT /api/settings/${model}/${id}:`, error); // Log más detallado
        return NextResponse.json({ error: `No se pudo actualizar la configuración '${id}' en '${model}': ${errorMessage}` }, { status: 500 });
    }
}

// DELETE a setting document
export async function DELETE(
    request: Request,
    { params }: { params: { setting: string, id: string } }
) {
    const model = params.setting;
    const id = params.id;
    if (!model || !id) {
        return NextResponse.json({ message: "Setting model or ID not specified" }, { status: 400 });
    }
    if (!db) {
        return NextResponse.json({ error: "Firestore is not initialized" }, { status: 500 });
    }

    try {
        await db.collection(model).doc(id).delete();
        return NextResponse.json({ message: `Configuración '${id}' en '${model}' eliminada exitosamente` }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error en DELETE /api/settings/${model}/${id}:`, error); // Log más detallado
        return NextResponse.json({ error: `No se pudo eliminar la configuración '${id}' en '${model}': ${errorMessage}` }, { status: 500 });
    }
}
