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
import { type Objective, type Task, listObjectives, listTasks, createTask } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [myObjectives, setMyObjectives] = useState<Objective[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTaskData, setNewTaskData] = useState({ title: '', objective_id: ''});

    // Simulating logged in user
    const currentUserId = "a1b2c3d4-e5f6-7890-1234-567890abcdef"; // Olivia Martin's UUID

    const fetchData = async () => {
        try {
            const [allObjectives, allTasks] = await Promise.all([
                listObjectives(),
                listTasks()
            ]);
            
            // This filtering should ideally happen on the backend
            const userObjectives = allObjectives.filter(o => o.assigned_to === currentUserId);
            const userObjectiveIds = userObjectives.map(o => o.id);

            setMyObjectives(userObjectives);
            setTasks(allTasks.filter(t => userObjectiveIds.includes(t.objective_id)));
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskData.title || !newTaskData.objective_id) return;

        const newTask: Task = {
            id: uuidv4(),
            title: newTaskData.title,
            objective_id: newTaskData.objective_id,
            completed: false,
            is_incentivized: false,
            incentive_id: undefined,
        };

        try {
            const savedTask = await createTask(newTask);
            setTasks(prev => [...prev, savedTask]);
            setNewTaskData({ title: '', objective_id: '' });
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to create task:", error);
        }
    };

    const handleToggleTask = (taskId: string, completed: boolean) => {
        // NOTE: The provided API does not have an endpoint to update a task.
        // This update is only reflected in the local state for a better UX.
        // In a real application, this should be a PATCH/PUT request to the backend.
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    };

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
                        const objectiveTasks = tasks.filter(t => t.objective_id === objective.id);
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
