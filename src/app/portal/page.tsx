'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Clock, User, ClipboardList, XCircle, Coffee } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const { toast } = useToast();
  // Main status
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState<Date | null>(new Date(new Date().getTime() - (91 * 60 * 1000))); // Mock: clocked in 91 mins ago
  
  // Break status
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);

  // Display state
  const [duration, setDuration] = useState("1h 31m");
  const [statusText, setStatusText] = useState("Entrada Marcada");
  const [statusTime, setStatusTime] = useState(`a las 09:01 AM`);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateDuration = () => {
        let startTime: Date | null = null;
        if (isOnBreak && breakStartTime) {
            startTime = breakStartTime;
        } else if (isClockedIn && clockInTime) {
            startTime = clockInTime;
        }

        if (startTime) {
            const now = new Date();
            const diffMs = now.getTime() - startTime.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setDuration(`${diffHrs}h ${diffMins}m`);
        }
    };

    if (isClockedIn) {
      updateDuration();
      interval = setInterval(updateDuration, 60000);
    } else {
      setDuration('');
    }

    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime, isOnBreak, breakStartTime]);

  const handleClockInOut = () => {
    if (isOnBreak) {
        toast({
            variant: "destructive",
            title: "Acción no permitida",
            description: "Debes finalizar tu descanso antes de marcar la salida.",
        });
        return;
    }
    
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
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (newStatus) {
            // Clocking IN
            const newClockInTime = new Date();
            setClockInTime(newClockInTime);
            setStatusText("Entrada Marcada");
            setStatusTime(`a las ${time}`);
            toast({
              title: "Fichaje Exitoso",
              description: `Se ha registrado tu entrada.`,
            });
        } else {
            // Clocking OUT
            setClockInTime(null);
            setStatusText("Salida Marcada");
            setStatusTime(`a las ${time}`);
            toast({
              title: "Fichaje Exitoso",
              description: `Se ha registrado tu salida.`,
            });
        }
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
  
  const handleBreakToggle = () => {
    if (!isClockedIn) {
      toast({
        variant: 'destructive',
        title: 'Acción no permitida',
        description: 'Debes marcar tu entrada antes de tomar un descanso.',
      });
      return;
    }
    
    const newOnBreakState = !isOnBreak;
    setIsOnBreak(newOnBreakState);

    if (newOnBreakState) {
      // Starting break
      setBreakStartTime(new Date());
      setStatusText('En Descanso');
      setStatusTime(`a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}`);
      toast({
        title: 'Descanso iniciado',
        description: 'Se ha registrado el inicio de tu descanso.',
      });
    } else {
      // Ending break
      setBreakStartTime(null);
      setStatusText('Entrada Marcada');
      setStatusTime(`a las ${clockInTime?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }) || ''}`);
      toast({
        title: 'Descanso finalizado',
        description: '¡De vuelta al trabajo!',
      });
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hola, Olivia</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu jornada y tus tareas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-accent-to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
            {
              isOnBreak ? <Coffee className="h-4 w-4 text-warning" /> :
              isClockedIn ? <Check className="h-4 w-4 text-accent" /> : 
              <XCircle className="h-4 w-4 text-destructive" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOnBreak ? 'text-warning' : isClockedIn ? 'text-accent' : 'text-destructive'}`}>{statusText}</div>
            <p className="text-xs text-muted-foreground">{isClockedIn ? `${isOnBreak ? 'Desde hace' : 'Llevas'} ${duration}` : statusTime}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-accent-to-card hover:bg-muted/50 transition-colors">
          <Link href="/portal/tasks">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarea Actual</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold truncate">Componentes UI</div>
                <p className="text-xs text-muted-foreground">Proyecto: Rediseño Web</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="bg-gradient-accent-to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horario de Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9:00 - 17:00</div>
            <p className="text-xs text-muted-foreground">Turno estándar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-accent-to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Ausencias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19 Ago</div>
            <p className="text-xs text-muted-foreground">Vacaciones (5 días)</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-accent-to-card">
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button onClick={handleClockInOut} variant={isClockedIn ? "destructive" : "active"} disabled={isOnBreak}>
                  {isClockedIn ? 'Marcar Salida' : 'Marcar Entrada'}
                </Button>
                <Button onClick={handleBreakToggle} variant="warning" disabled={!isClockedIn}>
                  {isOnBreak ? 'Finalizar Descanso' : 'Empezar Descanso'}
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/portal/absences">Solicitar Ausencia</Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/portal/tasks">Imputar Tareas</Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="bg-gradient-accent-to-card">
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
