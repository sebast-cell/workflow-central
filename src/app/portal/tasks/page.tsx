'use client'
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Tag } from "lucide-react";

type LoggedTask = {
    id: number;
    project: string;
    task: string;
    tags: string[];
    hours: number;
    date: string;
}

const initialTasks: LoggedTask[] = [
    { id: 1, project: "Rediseño del Sitio Web", task: "Desarrollo de Componentes UI", tags: ["frontend", "react"], hours: 4, date: "2024-08-15" },
    { id: 2, project: "Rediseño del Sitio Web", task: "Investigación y Análisis", tags: ["ux", "research"], hours: 2, date: "2024-08-14" },
    { id: 3, project: "Campaña de Marketing", task: "Creación de contenido para redes", tags: ["social media"], hours: 3, date: "2024-08-14" },
];

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = useState(initialTasks);
    
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
                    <p className="text-muted-foreground">Imputa las horas dedicadas a cada tarea y proyecto.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Imputar Tarea
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Imputar Nueva Tarea</DialogTitle>
                            <DialogDescription>
                                Registra el tiempo que has dedicado a una tarea específica.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="project">Proyecto</Label>
                                <Select>
                                    <SelectTrigger id="project">
                                        <SelectValue placeholder="Seleccionar proyecto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="website-redesign">Rediseño del Sitio Web</SelectItem>
                                        <SelectItem value="mobile-app">Desarrollo de App Móvil</SelectItem>
                                        <SelectItem value="marketing-campaign">Campaña de Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="task-description">Descripción de la Tarea</Label>
                                <Input id="task-description" placeholder="Ej., Reunión de planificación con el equipo" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="hours">Horas Dedicadas</Label>
                                <Input id="hours" type="number" placeholder="Ej., 2.5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Etiquetas</Label>
                                <Input id="tags" placeholder="Añade etiquetas separadas por comas (ej. frontend, bugfix)" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button>Guardar Tarea</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-gradient-accent-to-card">
                <CardHeader>
                    <CardTitle>Historial de Tareas Imputadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Proyecto</TableHead>
                                <TableHead>Tarea</TableHead>
                                <TableHead>Etiquetas</TableHead>
                                <TableHead className="text-right">Horas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.project}</TableCell>
                                    <TableCell>{task.task}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {task.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{task.hours}h</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
