
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ArrowUpRight, CheckCircle, Clock, Users, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
import { type Employee, type AttendanceLog, listEmployees, listAttendanceLogs } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseISO } from 'date-fns';


const getStatusVariant = (status: string): "active" | "destructive" | "warning" | "secondary" => {
  switch (status) {
    case "Entrada Marcada":
      return "active";
    case "Salida Marcada":
      return "destructive";
    case "En Descanso":
      return "warning";
    case "Activo":
      return "active";
    case "Deshabilitado":
        return "secondary";
    case "De Licencia":
        return "warning"
    default:
      return "secondary";
  }
};

const chartData = [
  { name: "Lun", hours: 180 },
  { name: "Mar", hours: 195 },
  { name: "Mié", hours: 210 },
  { name: "Jue", hours: 200 },
  { name: "Vie", hours: 220 },
  { name: "Sáb", hours: 40 },
  { name: "Dom", hours: 10 },
]

export default function Dashboard() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [employeesData, logsData] = await Promise.all([
              listEmployees(),
              listAttendanceLogs()
            ]);
            setEmployees(employeesData);

            // Transform logs into recent activities
            const transformedActivities = logsData
              .slice(0, 5) // Get latest 5 logs
              .map(log => {
                const employee = employeesData.find(e => e.id === log.employeeId);
                let activityText = '';
                switch(log.type) {
                  case 'Entrada': activityText = 'marcó entrada'; break;
                  case 'Salida': activityText = 'marcó salida'; break;
                  case 'Descanso': activityText = 'está en descanso'; break;
                  default: activityText = 'realizó una acción';
                }
                return {
                  name: log.employeeName,
                  activity: activityText,
                  time: formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true, locale: es }),
                  avatar: employee?.avatar || '?',
                  link: "/attendance"
                }
              });
            setRecentActivities(transformedActivities);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al cargar datos',
                description: 'No se pudieron obtener los datos para el panel.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [toast]);

  const activeEmployeesCount = employees.filter(e => e.status === 'Activo').length;
  const teamSummary = employees.slice(0, 5);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <Skeleton className="h-10 w-1/3" />
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
             <div className="grid gap-8 lg:grid-cols-2">
                <Skeleton className="h-[320px]" />
                <Skeleton className="h-[320px]" />
            </div>
            <Skeleton className="h-64" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">Una vista general de la actividad de tu equipo.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-accent-to-card">
          <Link href="/employees">
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEmployeesCount} / {employees.length || 0}</div>
                <p className="text-xs text-muted-foreground">+2 desde la última hora</p>
              </CardContent>
            </>
          </Link>
        </Card>
        <Card className="bg-gradient-accent-to-card">
          <Link href="/projects">
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos en Progreso</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+1 desde ayer</p>
              </CardContent>
            </>
          </Link>
        </Card>
        <Card className="bg-gradient-accent-to-card">
          <Link href="/absences">
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 vacaciones, 9 cambios de horario</p>
              </CardContent>
            </>
          </Link>
        </Card>
        <Card className="bg-gradient-accent-to-card">
          <Link href="/projects">
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tareas Completadas Hoy</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <p className="text-xs text-muted-foreground">+15% desde la semana pasada</p>
              </CardContent>
            </>
          </Link>
        </Card>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-gradient-accent-to-card">
          <CardHeader>
            <CardTitle>Resumen de Horas del Equipo</CardTitle>
            <CardDescription>Total de horas registradas esta semana.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gradient-accent-to-card">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Lo que tu equipo ha estado haciendo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                <Link href={activity.link} key={index}>
                  <div className="flex items-center rounded-lg px-2 py-2 transition-colors hover:bg-muted">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt="Avatar" />
                      <AvatarFallback>{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.activity}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </Link>
              )) : (
                 <div className="text-center text-muted-foreground p-4">No hay actividad reciente.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gradient-accent-to-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resumen del Equipo</CardTitle>
                <CardDescription>Un vistazo rápido al estado actual de tu equipo.</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/employees">
                  <>
                    Ver Todos
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Empleado</TableHead><TableHead>Departamento</TableHead><TableHead className="hidden sm:table-cell">Estado</TableHead><TableHead className="text-right">Horario</TableHead></TableRow></TableHeader>
              <TableBody>
                {teamSummary.length > 0 ? (
                  teamSummary.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = '/employees'}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt={member.name} />
                            <AvatarFallback>{member.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground hidden md:inline">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{member.schedule}</TableCell>
                      </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No hay empleados para mostrar. Comienza añadiendo uno en la sección de Empleados.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
