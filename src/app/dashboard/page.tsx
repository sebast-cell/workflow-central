'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ArrowUpRight, CheckCircle, Clock, Users, Zap, LayoutDashboard, GripVertical } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Responsive, WidthProvider } from 'react-grid-layout';
import './rgl.css';


const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Widget Components ---

const ActiveEmployeesWidget = () => (
  <Card className="h-full">
    <Link href="/employees" className="block h-full">
      <>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42 / 50</div>
          <p className="text-xs text-muted-foreground">+2 desde la última hora</p>
        </CardContent>
      </>
    </Link>
  </Card>
);

const ProjectsInProgressWidget = () => (
  <Card className="h-full">
    <Link href="/projects" className="block h-full">
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
);

const PendingRequestsWidget = () => (
  <Card className="h-full">
    <Link href="/absences" className="block h-full">
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
);

const TasksCompletedWidget = () => (
  <Card className="h-full">
    <Link href="/projects" className="block h-full">
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
);

const TeamHoursSummaryWidget = () => {
    const chartData = [ { name: "Lun", hours: 180 }, { name: "Mar", hours: 195 }, { name: "Mié", hours: 210 }, { name: "Jue", hours: 200 }, { name: "Vie", hours: 220 }, { name: "Sáb", hours: 40 }, { name: "Dom", hours: 10 } ];
    return (
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Resumen de Horas del Equipo</CardTitle>
            <CardDescription>Total de horas registradas esta semana.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
    );
}

const RecentActivityWidget = () => {
    const recentActivities = [ { name: "Olivia Martin", activity: "marcó entrada", time: "hace 5m", avatar: "OM", link: "/attendance" }, { name: "Jackson Lee", activity: "solicitó tiempo libre", time: "hace 15m", avatar: "JL", link: "/absences" }, { name: "Isabella Nguyen", activity: "completó la tarea 'Diseño de UI'", time: "hace 30m", avatar: "IN", link: "/projects" }, { name: "William Kim", activity: "está en descanso", time: "hace 45m", avatar: "WK", link: "/attendance" }, { name: "Sophia Davis", activity: "marcó salida", time: "hace 1h", avatar: "SD", link: "/attendance" }, ];
    return (
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Lo que tu equipo ha estado haciendo.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <Link href={activity.link} key={index} className="block rounded-lg -mx-2 px-2 py-2 transition-colors hover:bg-muted">
                    <>
                      <div className="flex items-center">
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
                    </>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
    );
};

const TeamSummaryWidget = () => {
    const teamSummary = [ { name: "Liam Johnson", email: "liam@workflow.com", department: "Ingeniería", status: "Entrada Marcada", schedule: "9:00 AM - 5:00 PM"}, { name: "Emma Wilson", email: "emma@workflow.com", department: "Marketing", status: "Entrada Marcada", schedule: "10:00 AM - 6:00 PM"}, { name: "Noah Brown", email: "noah@workflow.com", department: "Diseño", status: "En Descanso", schedule: "9:30 AM - 5:30 PM"}, { name: "Ava Smith", email: "ava@workflow.com", department: "Ventas", status: "Salida Marcada", schedule: "9:00 AM - 5:00 PM"}, ];
    const getStatusVariant = (status: string): "active" | "destructive" | "warning" | "secondary" => {
      switch (status) {
        case "Entrada Marcada":
          return "active";
        case "Salida Marcada":
          return "destructive";
        case "En Descanso":
          return "warning";
        default:
          return "secondary";
      }
    };
    return (
       <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
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
          <CardContent className="flex-1 overflow-auto">
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
                    <TableRow key={index} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = '/employees'}>
                    <TableCell>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground hidden md:inline">{member.email}</div>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{member.schedule}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    );
}

// --- Config and State ---

const ALL_WIDGETS_CONFIG = {
    'active-employees': { name: 'Empleados Activos', Component: ActiveEmployeesWidget, colSpan: 1, rowSpan: 1 },
    'projects-in-progress': { name: 'Proyectos en Progreso', Component: ProjectsInProgressWidget, colSpan: 1, rowSpan: 1 },
    'pending-requests': { name: 'Solicitudes Pendientes', Component: PendingRequestsWidget, colSpan: 1, rowSpan: 1 },
    'tasks-completed': { name: 'Tareas Completadas Hoy', Component: TasksCompletedWidget, colSpan: 1, rowSpan: 1 },
    'team-hours-summary': { name: 'Resumen de Horas', Component: TeamHoursSummaryWidget, colSpan: 2, rowSpan: 2 },
    'recent-activity': { name: 'Actividad Reciente', Component: RecentActivityWidget, colSpan: 2, rowSpan: 2 },
    'team-summary': { name: 'Resumen del Equipo', Component: TeamSummaryWidget, colSpan: 4, rowSpan: 2 },
};

const defaultLayouts = {
    lg: [
        { i: 'active-employees', x: 0, y: 0, w: 1, h: 1 },
        { i: 'projects-in-progress', x: 1, y: 0, w: 1, h: 1 },
        { i: 'pending-requests', x: 2, y: 0, w: 1, h: 1 },
        { i: 'tasks-completed', x: 3, y: 0, w: 1, h: 1 },
        { i: 'team-hours-summary', x: 0, y: 1, w: 2, h: 2 },
        { i: 'recent-activity', x: 2, y: 1, w: 2, h: 2 },
        { i: 'team-summary', x: 0, y: 3, w: 4, h: 2 },
    ]
};
const defaultVisibleWidgets = Object.keys(ALL_WIDGETS_CONFIG).reduce((acc, id) => ({ ...acc, [id]: true }), {});


export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [visibleWidgets, setVisibleWidgets] = useState(defaultVisibleWidgets);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedStateRaw = localStorage.getItem('dashboard-layout');
      if (savedStateRaw) {
        const savedState = JSON.parse(savedStateRaw);
        
        const newVisibility = { ...defaultVisibleWidgets, ...savedState.visibility };
        setVisibleWidgets(newVisibility);

        if (savedState.layouts) {
             setLayouts(savedState.layouts);
        }
      }
    } catch (e) {
      console.error("Could not load dashboard layout from localStorage", e);
    }
  }, []);

  const saveStateToLocalStorage = (newState: { layouts: any, visibility: any }) => {
     if (isClient) {
        localStorage.setItem('dashboard-layout', JSON.stringify(newState));
     }
  }

  const handleLayoutChange = (layout: any, newLayouts: any) => {
    setLayouts(newLayouts);
    saveStateToLocalStorage({ layouts: newLayouts, visibility: visibleWidgets });
  };

  function handleVisibilityChange(id: string, checked: boolean) {
    const newVisibility = {
        ...visibleWidgets,
        [id]: checked
    };
    setVisibleWidgets(newVisibility);
    saveStateToLocalStorage({ layouts, visibility: newVisibility });
  }

  const displayedWidgets = useMemo(() => {
    return Object.keys(ALL_WIDGETS_CONFIG).filter(id => visibleWidgets[id]);
  }, [visibleWidgets]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Arrastra, suelta y personaliza la vista de tu panel.</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Personalizar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mostrar/Ocultar Widgets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(ALL_WIDGETS_CONFIG).map(id => (
                    <DropdownMenuCheckboxItem
                        key={id}
                        checked={visibleWidgets[id]}
                        onCheckedChange={(checked) => handleVisibilityChange(id, !!checked)}
                    >
                        {ALL_WIDGETS_CONFIG[id].name}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ResponsiveGridLayout
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 2, sm: 1, xs: 1, xxs: 1 }}
        rowHeight={150}
        draggableHandle=".drag-handle"
        margin={[24, 24]}
      >
        {displayedWidgets.map((id) => {
          const config = ALL_WIDGETS_CONFIG[id as keyof typeof ALL_WIDGETS_CONFIG];
          return (
            <div key={id} className="group relative h-full">
               <div className="drag-handle absolute top-2 right-2 p-1 cursor-grab bg-background/50 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              <config.Component />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}