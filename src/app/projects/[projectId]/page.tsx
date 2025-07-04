'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Task = {
    id: number;
    name: string;
    assignee: string;
    status: "Completado" | "En Progreso" | "Pendiente";
    hours: number;
};

type Project = {
    id: number;
    name: string;
    client: string;
    progress: number;
    color: string;
    members: string[];
    tasks: Task[];
};

// Mock data - In a real app, this would be fetched from an API
const initialProjects: Project[] = [
  { id: 1, name: "Rediseño del Sitio Web", client: "Innovate Inc.", progress: 75, color: "bg-blue-500", members: ["OM", "JL", "IN"], tasks: [
    {id: 1, name: "Investigación y Análisis", assignee: "Olivia Martin", status: "Completado", hours: 20},
    {id: 2, name: "Diseño de Wireframes", assignee: "Jackson Lee", status: "En Progreso", hours: 15},
    {id: 3, name: "Desarrollo de Componentes UI", assignee: "Olivia Martin", status: "En Progreso", hours: 25},
    {id: 4, name: "Pruebas de Usuario", assignee: "Isabella Nguyen", status: "Pendiente", hours: 10},
  ] },
  { id: 2, name: "Desarrollo de App Móvil", client: "Tech Solutions", progress: 40, color: "bg-purple-500", members: ["WK", "SD"], tasks: [] },
  { id: 3, name: "Campaña de Marketing", client: "Growth Co.", progress: 90, color: "bg-green-500", members: ["IN", "LG"], tasks: [] },
  { id: 4, name: "Integración de API", client: "Connective", progress: 25, color: "bg-orange-500", members: ["WK"], tasks: [] },
  { id: 5, name: "Análisis de Informe T3", client: "Interno", progress: 100, color: "bg-gray-500", members: ["LG"], tasks: [] },
];

const membersData: {[key: string]: { name: string, role: string, avatar: string }} = {
    "OM": { name: "Olivia Martin", role: "Desarrollador Frontend", avatar: "OM"},
    "JL": { name: "Jackson Lee", role: "Diseñador UI/UX", avatar: "JL" },
    "IN": { name: "Isabella Nguyen", role: "Estratega de Contenido", avatar: "IN" },
    "WK": { name: "William Kim", role: "Desarrollador Backend", avatar: "WK" },
    "SD": { name: "Sophia Davis", role: "Ejecutivo de Cuentas", avatar: "SD" },
    "LG": { name: "Liam Garcia", role: "Generalista de RRHH", avatar: "LG" },
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId;
    const [project, setProject] = useState(initialProjects.find(p => p.id.toString() === projectId));

    if (!project) {
        return <div className="p-8">Proyecto no encontrado.</div>
    }

    const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('taskName') as string;
        const assignee = formData.get('assignee') as string;
        const status = formData.get('status') as "Completado" | "En Progreso" | "Pendiente";
        
        if (!name || !assignee || !status) return;

        const newTask: Task = {
            id: Date.now(),
            name,
            assignee: membersData[assignee].name,
            status,
            hours: 0,
        }
        
        setProject(prev => prev ? {...prev, tasks: [...prev.tasks, newTask]} : undefined);
    }

    const getStatusBadge = (status: string) => {
        switch(status) {
            case "Completado": return "bg-green-100 text-green-800";
            case "En Progreso": return "bg-yellow-100 text-yellow-800";
            case "Pendiente": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/projects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Proyectos
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
                                <CardDescription className="text-lg">{project.client}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${project.color}`}></div>
                                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Editar</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Progress value={project.progress} />
                            <p className="text-sm text-muted-foreground">{project.progress}% completado</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Tabs defaultValue="tasks">
                <TabsList>
                    <TabsTrigger value="tasks">Tareas</TabsTrigger>
                    <TabsTrigger value="members">Miembros</TabsTrigger>
                    <TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                             <CardTitle className="font-headline">Lista de Tareas</CardTitle>
                             <CardDescription>Seguimiento de todas las tareas asociadas al proyecto.</CardDescription>
                           </div>
                           <Dialog>
                               <DialogTrigger asChild>
                                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Nueva Tarea</Button>
                               </DialogTrigger>
                               <DialogContent>
                                   <DialogHeader>
                                       <DialogTitle className="font-headline">Añadir Nueva Tarea</DialogTitle>
                                   </DialogHeader>
                                   <form onSubmit={handleAddTask}>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="taskName">Nombre de la Tarea</Label>
                                                <Input id="taskName" name="taskName" placeholder="Ej. Diseño de Wireframes"/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="assignee">Asignar a</Label>
                                                <Select name="assignee">
                                                    <SelectTrigger id="assignee">
                                                        <SelectValue placeholder="Seleccionar miembro"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {project.members.map(m => (
                                                            <SelectItem key={m} value={m}>{membersData[m].name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Estado</Label>
                                                <Select name="status" defaultValue="Pendiente">
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Seleccionar estado"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                                                        <SelectItem value="Completado">Completado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Añadir Tarea</Button>
                                        </DialogFooter>
                                   </form>
                               </DialogContent>
                           </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tarea</TableHead>
                                        <TableHead>Asignado a</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Horas Imputadas</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.tasks.map(task => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.name}</TableCell>
                                            <TableCell>{task.assignee}</TableCell>
                                            <TableCell><Badge variant="secondary" className={getStatusBadge(task.status)}>{task.status}</Badge></TableCell>
                                            <TableCell className="text-right">{task.hours}h</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {project.tasks.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">No hay tareas para este proyecto.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="members">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                             <CardTitle className="font-headline">Miembros del Proyecto</CardTitle>
                             <CardDescription>Empleados asignados a este proyecto.</CardDescription>
                           </div>
                           <Button><PlusCircle className="mr-2 h-4 w-4"/> Asignar Miembros</Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {project.members.map(memberKey => {
                                const member = membersData[memberKey];
                                return (
                                <Card key={memberKey}>
                                    <CardContent className="pt-6 flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt={member.name} />
                                            <AvatarFallback>{member.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )})}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="profitability">
                    <Card>
                         <CardHeader>
                             <CardTitle className="font-headline">Informe de Rentabilidad</CardTitle>
                             <CardDescription>Análisis de costos y rentabilidad del proyecto.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            <div className="text-center text-muted-foreground py-12">
                                <p>Los informes de rentabilidad aparecerán aquí.</p>
                            </div>
                         </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
