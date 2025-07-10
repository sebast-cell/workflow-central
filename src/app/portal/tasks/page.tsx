
'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Goal, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { type Objective, type Task, listObjectives, listTasks, createTask } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeTasksPage() {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [myObjectives, setMyObjectives] = useState<Objective[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTaskData, setNewTaskData] = useState({ title: '', objective_id: ''});

    // In a real app, this would come from an auth context
    const FAKE_EMPLOYEE_ID = "2"; 

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [allObjectives, allTasks] = await Promise.all([listObjectives(), listTasks()]);
            const employeeObjectives = allObjectives.filter(o => o.type === 'individual' && o.assigned_to === FAKE_EMPLOYEE_ID);
            
            setMyObjectives(employeeObjectives);
            // Show all tasks related to my objectives
            const myTaskIds = new Set(employeeObjectives.map(o => o.id));
            setTasks(allTasks.filter(t => myTaskIds.has(t.objective_id)));

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar tus tareas y objetivos.'})
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskData.title || !newTaskData.objective_id) {
            toast({ variant: 'destructive', title: "Error", description: "Debes seleccionar un objetivo y un título para la tarea." });
            return;
        }

        setIsSubmitting(true);
        try {
            const newTaskPayload: Omit<Task, 'id'> = {
                title: newTaskData.title,
                objective_id: newTaskData.objective_id,
                completed: false,
                is_incentivized: false,
            };
            const savedTask = await createTask(newTaskPayload);
            setTasks(prev => [...prev, savedTask]);
            setNewTaskData({ title: '', objective_id: '' });
            setIsDialogOpen(false);
            toast({ title: "Tarea creada", description: "La nueva tarea ha sido añadida." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "No se pudo crear la tarea." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
        
        // In a real app, you would have an updateTask API call here.
        // Since we don't have one, we'll just show a toast.
        toast({ title: "Estado de la tarea actualizado."});
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
                        <Button disabled={myObjectives.length === 0 || isLoading}>
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
                                        required
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
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Guardar Tarea
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-80">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : myObjectives.length > 0 ? (
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
