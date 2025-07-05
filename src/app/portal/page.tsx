'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Clock, FileText, User, ClipboardList, XCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [statusText, setStatusText] = useState("Entrada Marcada");
  const [statusTime, setStatusTime] = useState(`a las 09:01 AM`);

  const handleClockInOut = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Error de Geolocalización",
        description: "Tu navegador no soporta la geolocalización.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newStatus = !isClockedIn;
        setIsClockedIn(newStatus);
        const newStatusText = newStatus ? "Entrada Marcada" : "Salida Marcada";
        setStatusText(newStatusText);
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
        setStatusTime(`a las ${time}`);
        
        toast({
          title: "Fichaje Exitoso",
          description: `Se ha registrado tu ${newStatusText.toLowerCase()}.`,
        });
      },
      (error) => {
        let description = "No se pudo obtener tu ubicación. Por favor, activa los permisos en tu navegador.";
        if (error.code === error.PERMISSION_DENIED) {
            description = "Has denegado el permiso de ubicación. Por favor, actívalo en la configuración de tu navegador para poder fichar.";
        }
        toast({
          variant: "destructive",
          title: "Error de Ubicación",
          description: description,
        });
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hola, Olivia</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu jornada y tus tareas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
            {isClockedIn ? <Check className="h-4 w-4 text-accent" /> : <XCircle className="h-4 w-4 text-destructive" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isClockedIn ? 'text-accent' : 'text-destructive'}`}>{statusText}</div>
            <p className="text-xs text-muted-foreground">{statusTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horario de Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9:00 - 17:00</div>
            <p className="text-xs text-muted-foreground">Turno estándar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Ausencias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19 Ago</div>
            <p className="text-xs text-muted-foreground">Vacaciones (5 días)</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Pendientes de firma</p>
            </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button onClick={handleClockInOut}>{isClockedIn ? 'Marcar Salida' : 'Marcar Entrada'}</Button>
                <Button variant="outline">Empezar Descanso</Button>
                <Button asChild variant="secondary">
                    <Link href="/portal/absences">Solicitar Ausencia</Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/portal/tasks">Imputar Tareas</Link>
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>Mantén tu información actualizada.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <User className="w-10 h-10 text-primary" />
                <div>
                    <p className="font-semibold">Olivia Martin</p>
                    <p className="text-sm text-muted-foreground">olivia.martin@example.com</p>
                    <Button asChild variant="link" className="p-0 h-auto mt-1">
                        <Link href="/portal/profile">Editar Perfil</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
