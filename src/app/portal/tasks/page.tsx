'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Goal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Objective = {
  id: string;
  title: string;
  assigned_to: string;
};

type Task = {
  id: string;
  title: string;
  objective_id: string;
  completed: boolean;
  is_incentivized: boolean;
  incentive_id?: string;
};

const OBJECTIVES_STORAGE_KEY = 'workflow-central-objectives';
const TASKS_STORAGE_KEY = 'workflow-central-tasks';

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [myObjectives, setMyObjectives] = useState<Objective[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTaskData, setNewTaskData] = useState({ title: '', objective_id: ''});

    useEffect(() => {
        try {
            const storedObjectives = localStorage.getItem(OBJECTIVES_STORAGE_KEY);
            if (storedObjectives) {
                const allObjectives: Objective[] = JSON.parse(storedObjectives);
                setMyObjectives(allObjectives.filter(o => o.assigned_to === 'Olivia Martin'));
            }

            const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            console.error("Error loading data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error("Error saving tasks to localStorage", error);
        }
    }, [tasks]);

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskData.title || !newTaskData.objective_id) return;

        const newTask: Task = {
            id: Date.now().toString(),
            title: newTaskData.title,
            objective_id: newTaskData.objective_id,
            completed: false,
            is_incentivized: false
        };

        setTasks(prev => [...prev, newTask]);
        setNewTaskData({ title: '', objective_id: '' });
        setIsDialogOpen(false);
    };

    const handleToggleTask = (taskId: string, completed: boolean) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    };

    const userObjectiveIds = myObjectives.map(o => o.id);
    const userTasks = tasks.filter(t => userObjectiveIds.includes(t.objective_id));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
                    <p className="text-muted-foreground">Gestiona las tareas asociadas a tus objetivos.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={myObjectives.length === 0}>
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
                        <form onSubmit={handleCreateTask}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objective">Objetivo</Label>
                                    <Select 
                                        value={newTaskData.objective_id}
                                        onValueChange={(value) => setNewTaskData({...newTaskData, objective_id: value})}
                                    >
                                        <SelectTrigger id="objective">
                                            <SelectValue placeholder="Seleccionar objetivo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myObjectives.map(obj => (
                                                <SelectItem key={obj.id} value={obj.id}>{obj.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="task-title">Título de la Tarea</Label>
                                    <Input 
                                        id="task-title" 
                                        placeholder="Ej., Diseñar la nueva landing page" 
                                        value={newTaskData.title}
                                        onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Guardar Tarea</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {myObjectives.length > 0 ? (
                <div className="space-y-6">
                    {myObjectives.map(objective => {
                        const objectiveTasks = userTasks.filter(t => t.objective_id === objective.id);
                        return (
                            <Card key={objective.id} className="bg-gradient-accent-to-card">
                                <CardHeader>
                                    <CardTitle>{objective.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tarea</TableHead>
                                                <TableHead className="text-right w-24">Completado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {objectiveTasks.length > 0 ? objectiveTasks.map(task => (
                                                <TableRow key={task.id}>
                                                    <TableCell className="font-medium">{task.title}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Checkbox 
                                                            checked={task.completed} 
                                                            onCheckedChange={(checked) => handleToggleTask(task.id, Boolean(checked))}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                        No hay tareas para este objetivo.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed h-80">
                     <Goal className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Sin Objetivos Asignados</h3>
                    <p className="mt-1 text-sm text-muted-foreground">No puedes crear tareas hasta que tengas un objetivo.</p>
                </div>
            )}
        </div>
    )
}
