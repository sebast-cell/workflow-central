'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ArrowUpRight, CheckCircle, Clock, Users, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const chartData = [
    { name: "Lun", hours: 180 },
    { name: "Mar", hours: 195 },
    { name: "Mié", hours: 210 },
    { name: "Jue", hours: 200 },
    { name: "Vie", hours: 220 },
    { name: "Sáb", hours: 40 },
    { name: "Dom", hours: 10 },
  ]

  const recentActivities = [
    { name: "Olivia Martin", activity: "marcó entrada", time: "hace 5m", avatar: "OM" },
    { name: "Jackson Lee", activity: "solicitó tiempo libre", time: "hace 15m", avatar: "JL" },
    { name: "Isabella Nguyen", activity: "completó la tarea 'Diseño de UI'", time: "hace 30m", avatar: "IN" },
    { name: "William Kim", activity: "está en descanso", time: "hace 45m", avatar: "WK" },
    { name: "Sophia Davis", activity: "marcó salida", time: "hace 1h", avatar: "SD" },
  ]

  const teamSummary = [
      { name: "Liam Johnson", email: "liam@workflow.com", department: "Ingeniería", status: "Entrada Marcada", schedule: "9:00 AM - 5:00 PM"},
      { name: "Emma Wilson", email: "emma@workflow.com", department: "Marketing", status: "Entrada Marcada", schedule: "10:00 AM - 6:00 PM"},
      { name: "Noah Brown", email: "noah@workflow.com", department: "Diseño", status: "En Descanso", schedule: "9:30 AM - 5:30 PM"},
      { name: "Ava Smith", email: "ava@workflow.com", department: "Ventas", status: "Salida Marcada", schedule: "9:00 AM - 5:00 PM"},
  ]
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">Un resumen de todas las tareas de gestión para tu equipo.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 / 50</div>
            <p className="text-xs text-muted-foreground">+2 desde la última hora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos en Progreso</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 vacaciones, 9 cambios de horario</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">+15% desde la semana pasada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Resumen de Horas del Equipo</CardTitle>
            <CardDescription>Total de horas registradas esta semana.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Actividad Reciente</CardTitle>
            <CardDescription>Lo que tu equipo ha estado haciendo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline">Resumen del Equipo</CardTitle>
                <CardDescription>
                  Un vistazo rápido al estado actual de tu equipo.
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/employees">
                  Ver Todos
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="text-right">Horario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamSummary.map((member, index) => (
                    <TableRow key={index}>
                    <TableCell>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground hidden md:inline">{member.email}</div>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={cn(
                            member.status === "Entrada Marcada" && "border-accent text-accent",
                            member.status === "Salida Marcada" && "border-destructive text-destructive",
                            member.status === "En Descanso" && "border-warning text-warning"
                        )}>
                            {member.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{member.schedule}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  )
}
