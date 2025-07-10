
'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Clock, User, ClipboardList, XCircle, Coffee, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { type AttendanceLog, listAttendanceLogs, createAttendanceLog } from "@/lib/api";
import { isToday, parseISO } from "date-fns";

// In a real app, this would come from an auth context
const FAKE_EMPLOYEE = {
    id: "1", // Corresponds to Olivia Martin in the mock employee data
    name: "Olivia Martin",
    department: "Ingeniería"
};

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Status state
  const [lastEvent, setLastEvent] = useState<AttendanceLog | null>(null);
  
  // Display state
  const [duration, setDuration] = useState("");
  const [statusText, setStatusText] = useState("Sin Fichar");
  const [statusTime, setStatusTime] = useState("Marca tu entrada para empezar");

  const fetchStatus = async () => {
    try {
        const logs = await listAttendanceLogs();
        const todayLogs = logs
            .filter(log => log.employeeId === FAKE_EMPLOYEE.id && isToday(parseISO(log.timestamp)))
            .sort((a,b) => b.timestamp.localeCompare(a.timestamp)); // Most recent first

        setLastEvent(todayLogs[0] || null);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar tu estado actual.' });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateDuration = () => {
        if (lastEvent && (lastEvent.type === 'Entrada' || lastEvent.type === 'Descanso')) {
            const startTime = parseISO(lastEvent.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - startTime.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setDuration(`${diffHrs}h ${diffMins}m`);
        }
    };
    
    if (lastEvent) {
      const time = parseISO(lastEvent.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
      switch(lastEvent.type) {
        case 'Entrada':
          setStatusText('Entrada Marcada');
          setStatusTime(`a las ${time}`);
          break;
        case 'Descanso':
          setStatusText('En Descanso');
          setStatusTime(`a las ${time}`);
          break;
        case 'Salida':
          setStatusText('Salida Marcada');
          setStatusTime(`a las ${time}`);
          setDuration('');
          break;
      }
      updateDuration();
      if(lastEvent.type !== 'Salida') {
        interval = setInterval(updateDuration, 60000);
      }
    } else {
        setStatusText("Sin Fichar");
        setStatusTime("Marca tu entrada para empezar");
        setDuration('');
    }

    return () => clearInterval(interval);
  }, [lastEvent]);

  const handleClockAction = async (type: 'Entrada' | 'Salida' | 'Descanso') => {
      if (isLoading) return;

      if (!navigator.geolocation) {
        toast({ variant: "destructive", title: "Error", description: "Tu navegador no soporta la geolocalización." });
        return;
      }
      
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLog: Omit<AttendanceLog, 'id'> = {
              employeeId: FAKE_EMPLOYEE.id,
              employeeName: FAKE_EMPLOYEE.name,
              department: FAKE_EMPLOYEE.department,
              timestamp: new Date().toISOString(),
              type: type,
              location: 'Fichaje Móvil',
              lat: latitude,
              lng: longitude,
          };

          try {
              await createAttendanceLog(newLog);
              toast({ title: "Fichaje Exitoso", description: `Se ha registrado tu ${type.toLowerCase()}.` });
              await fetchStatus();
          } catch (error) {
               toast({ variant: "destructive", title: "Error al Fichar", description: "No se pudo guardar el registro." });
               setIsLoading(false);
          }
        },
        () => {
           toast({ variant: "destructive", title: "Error de Ubicación", description: "No se pudo obtener tu ubicación." });
           setIsLoading(false);
        }
      );
  };
  
  const isClockedIn = lastEvent && lastEvent.type !== 'Salida';
  const isOnBreak = lastEvent && lastEvent.type === 'Descanso';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido al Portal del Empleado</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu jornada y tus tareas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-accent-to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
            { isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> :
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-accent-to-card">
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => handleClockAction(isClockedIn ? 'Salida' : 'Entrada')} variant={isClockedIn ? "destructive" : "active"} disabled={isOnBreak || isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  {isClockedIn ? 'Marcar Salida' : 'Marcar Entrada'}
                </Button>
                <Button onClick={() => handleClockAction(isOnBreak ? 'Entrada' : 'Descanso')} variant="warning" disabled={!isClockedIn || isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
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
                    <p className="font-semibold">{FAKE_EMPLOYEE.name}</p>
                    <p className="text-sm text-muted-foreground">empleado@email.com</p>
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
