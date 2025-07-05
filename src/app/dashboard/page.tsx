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

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Widget Components ---

const ActiveEmployeesWidget = () => (
  <Card className="h-full">
    <Link href="/employees" className="block h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">42 / 50</div>
        <p className="text-xs text-muted-foreground">+2 desde la última hora</p>
      </CardContent>
    </Link>
  </Card>
);

const ProjectsInProgressWidget = () => (
  <Card className="h-full">
    <Link href="/projects" className="block h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Proyectos en Progreso</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">5</div>
        <p className="text-xs text-muted-foreground">+1 desde ayer</p>
      </CardContent>
    </Link>
  </Card>
);

const PendingRequestsWidget = () => (
  <Card className="h-full">
    <Link href="/absences" className="block h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">12</div>
        <p className="text-xs text-muted-foreground">3 vacaciones, 9 cambios de horario</p>
      </CardContent>
    </Link>
  </Card>
);

const TasksCompletedWidget = () => (
  <Card className="h-full">
    <Link href="/projects" className="block h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tareas Completadas Hoy</CardTitle>
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">87</div>
        <p className="text-xs text-muted-foreground">+15% desde la semana pasada</p>
      </CardContent>
    </Link>
  </Card>
);

const TeamHoursSummaryWidget = () => {
    const chartData = [ { name: "Lun", hours: 180 }, { name: "Mar", hours: 195 }, { name: "Mié", hours: 210 }, { name: "Jue", hours: 200 }, { name: "Vie", hours: 220 }, { name: "Sáb", hours: 40 }, { name: "Dom", hours: 10 } ];
    return (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Horas del Equipo</CardTitle>
            <CardDescription>Total de horas registradas esta semana.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
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
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Lo que tu equipo ha estado haciendo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <Link href={activity.link} key={index} className="block rounded-lg -mx-2 px-2 py-2 transition-colors hover:bg-muted">
                    <div className="flex items-center">
                    <Avatar className="h-9 w-9"> <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt="Avatar" /> <AvatarFallback>{activity.avatar}</AvatarFallback> </Avatar>
                    <div className="ml-4 space-y-1"> <p className="text-sm font-medium leading-none">{activity.name}</p> <p className="text-sm text-muted-foreground">{activity.activity}</p> </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
    );
};

const TeamSummaryWidget = () => {
    const teamSummary = [ { name: "Liam Johnson", email: "liam@workflow.com", department: "Ingeniería", status: "Entrada Marcada", schedule: "9:00 AM - 5:00 PM"}, { name: "Emma Wilson", email: "emma@workflow.com", department: "Marketing", status: "Entrada Marcada", schedule: "10:00 AM - 6:00 PM"}, { name: "Noah Brown", email: "noah@workflow.com", department: "Diseño", status: "En Descanso", schedule: "9:30 AM - 5:30 PM"}, { name: "Ava Smith", email: "ava@workflow.com", department: "Ventas", status: "Salida Marcada", schedule: "9:00 AM - 5:00 PM"}, ];
    const getStatusVariant = (status: string) => { switch (status) { case "Entrada Marcada": return "active"; case "Salida Marcada": return "destructive"; case "En Descanso": return "warning"; default: return "secondary"; } };
    return (
       <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1"> <CardTitle>Resumen del Equipo</CardTitle> <CardDescription>Un vistazo rápido al estado actual de tu equipo.</CardDescription> </div>
              <Button asChild size="sm" variant="outline"> <Link href="/employees">Ver Todos<ArrowUpRight className="h-4 w-4 ml-2" /></Link> </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader> <TableRow> <TableHead>Empleado</TableHead> <TableHead>Departamento</TableHead> <TableHead className="hidden sm:table-cell">Estado</TableHead> <TableHead className="text-right">Horario</TableHead> </TableRow> </TableHeader>
              <TableBody>
                {teamSummary.map((member, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = '/employees'}>
                    <TableCell> <div className="font-medium">{member.name}</div> <div className="text-sm text-muted-foreground hidden md:inline">{member.email}</div> </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell className="hidden sm:table-cell"> <Badge variant={getStatusVariant(member.status)}>{member.status}</Badge> </TableCell>
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
    'team-summary': { name: 'Resumen del Equipo', Component: TeamSummaryWidget, colSpan: 4, rowSpan: 1 },
};

const defaultOrder = Object.keys(ALL_WIDGETS_CONFIG);
const defaultVisibility = defaultOrder.reduce((acc, id) => ({ ...acc, [id]: true }), {});

// --- Sortable Widget Wrapper ---

function SortableWidget({ id, widgetConfig, children }: { id: string, widgetConfig: typeof ALL_WIDGETS_CONFIG[string], children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colSpanClasses = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    4: 'lg:col-span-4',
  };

  const rowSpanClasses = {
    1: 'lg:row-span-1',
    2: 'lg:row-span-2',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        colSpanClasses[widgetConfig.colSpan as keyof typeof colSpanClasses],
        rowSpanClasses[widgetConfig.rowSpan as keyof typeof rowSpanClasses]
      )}
    >
      <div {...attributes} {...listeners} className="absolute top-2 right-2 p-1 cursor-grab bg-background/50 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}


export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [widgetState, setWidgetState] = useState({
    order: defaultOrder,
    visibility: defaultVisibility,
  });

  useEffect(() => {
    setIsClient(true);
    try {
      const savedStateRaw = localStorage.getItem('dashboard-layout');
      if (savedStateRaw) {
        const savedState = JSON.parse(savedStateRaw);
        // Ensure saved state has all widgets, adding new ones if the app was updated
        const newVisibility = { ...defaultVisibility, ...savedState.visibility };
        const newOrder = defaultOrder.filter(id => !savedState.order.includes(id));
        setWidgetState({
            order: [...savedState.order, ...newOrder],
            visibility: newVisibility,
        });
      }
    } catch (e) {
      console.error("Could not load dashboard layout from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('dashboard-layout', JSON.stringify(widgetState));
    }
  }, [widgetState, isClient]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetState((current) => {
        const oldIndex = current.order.indexOf(active.id as string);
        const newIndex = current.order.indexOf(over.id as string);
        return {
          ...current,
          order: arrayMove(current.order, oldIndex, newIndex),
        };
      });
    }
  }

  function handleVisibilityChange(id: string, checked: boolean) {
    setWidgetState(current => ({
        ...current,
        visibility: {
            ...current.visibility,
            [id]: checked
        }
    }));
  }

  const visibleWidgets = useMemo(() => {
    return widgetState.order.filter(id => widgetState.visibility[id]);
  }, [widgetState]);

  if (!isClient) {
    // You can return a loading skeleton here if you want
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
                {defaultOrder.map(id => (
                    <DropdownMenuCheckboxItem
                        key={id}
                        checked={widgetState.visibility[id]}
                        onCheckedChange={(checked) => handleVisibilityChange(id, !!checked)}
                    >
                        {ALL_WIDGETS_CONFIG[id].name}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleWidgets} strategy={rectSwappingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-6">
            {visibleWidgets.map((id) => {
                const config = ALL_WIDGETS_CONFIG[id];
                return (
                    <SortableWidget key={id} id={id} widgetConfig={config}>
                        <config.Component />
                    </SortableWidget>
                )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
