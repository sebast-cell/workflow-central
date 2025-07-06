'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Task = {
    id: string; // UUID
    title: string;
    objective_id: string; // UUID
    completed: boolean;
}

type Objective = {
  id: string; // UUID
  title: string;
};

const initialTasks: Task[] = [
    { id: "1", title: "Desarrollo de Componentes UI", objective_id: "1", completed: true },
    { id: "2", title: "Investigación y Análisis", objective_id: "1", completed: true },
    { id: "3", title: "Creación de contenido para redes", objective_id: "2", completed: false },
];

const mockObjectives: Objective[] = [
    { id: "1", title: "Lanzar el rediseño de la web" },
    { id: "2", title: "Aumentar el engagement en redes sociales un 15%" },
];


export default function EmployeeTasksPage() {
    const [tasks, setTasks] = useState(initialTasks);
    const [objectives, setObjectives] = useState(mockObjectives);
    
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
                    <p className="text-muted-foreground">Gestiona las tareas asociadas a tus objetivos.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Tarea
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nueva Tarea</DialogTitle>
                            <DialogDescription>
                                Añade una nueva tarea a uno de tus objetivos.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="objective">Objetivo</Label>
                                <Select>
                                    <SelectTrigger id="objective">
                                        <SelectValue placeholder="Seleccionar objetivo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {objectives.map(obj => (
                                            <SelectItem key={obj.id} value={obj.id}>{obj.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="task-title">Título de la Tarea</Label>
                                <Input id="task-title" placeholder="Ej., Diseñar la nueva landing page" />
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
                    <CardTitle>Lista de Tareas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarea</TableHead>
                                <TableHead>Objetivo</TableHead>
                                <TableHead className="text-right">Completado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{objectives.find(o => o.id === task.objective_id)?.title || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Checkbox checked={task.completed} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
