'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Este es el componente que ya tenías, lo reutilizamos aquí.
function ClockWidget() {
    const { toast } = useToast();

    const handleClockIn = () => {
        toast({ title: 'Fichaje de entrada registrado.' });
        // Aquí iría la lógica para guardar en Firestore...
    };

    const handleClockOut = () => {
        toast({ title: 'Fichaje de salida registrado.' });
        // Aquí iría la lógica para guardar en Firestore...
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Fichaje Rápido
                </CardTitle>
                <CardDescription>Registra tu entrada y salida del día.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button onClick={handleClockIn} className="w-full bg-green-600 hover:bg-green-700">
                    <ArrowRight className="mr-2 h-4 w-4" /> Entrada
                </Button>
                <Button onClick={handleClockOut} className="w-full bg-red-600 hover:bg-red-700">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Salida
                </Button>
            </CardContent>
        </Card>
    );
}

export default function PortalPage() {
  // Usamos el hook useAuth() para obtener los datos del usuario,
  // en lugar de la función getSession() que daba error.
  const { userData } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Portal de Empleado
        </h1>
        <p className="text-muted-foreground">
          Bienvenido de nuevo, {userData?.name}. Aquí tienes tus accesos directos.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
            <ClockWidget />
            <Card>
                <CardHeader>
                    <CardTitle>Accesos Directos</CardTitle>
                    <CardDescription>Gestiona tus tareas y ausencias.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => router.push('/portal/tasks')}>
                        Ver mis Tareas
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/portal/absences')}>
                        Solicitar Ausencia
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
