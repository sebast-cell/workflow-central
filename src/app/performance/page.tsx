'use client'

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, PlusCircle, Gift, X, Check, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { type Objective, type Task, type Incentive, type Project, type Department, type Employee, listObjectives, listTasks, listIncentives, listProjects, createObjective, calculateIncentiveForObjective, getTasksByObjective, createTask } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

const reviewCycles = [
  { name: "Revisión Anual 2024", status: "Completado", period: "01 Ene - 31 Dic, 2024", participants: 48 },
  { name: "Check-in Q3 2024", status: "En Progreso", period: "01 Jul - 30 Sep, 2024", participants: 50 },
  { name: "Evaluación de Nuevas Incorporaciones", status: "Programado", period: "01 Oct - 31 Oct, 2024", participants: 4 },
];

const initialEmployees: Employee[] = [
  { id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", name: "Olivia Martin", email: "olivia.martin@example.com" },
  { id: "b2c3d4e5-f6a7-8901-2345-67890abcdef1", name: "Jackson Lee", email: "jackson.lee@example.com" },
  { id: "c3d4e5f6-a7b8-9012-3456-7890abcdef2", name: "Isabella Nguyen", email: "isabella.nguyen@example.com" },
];

const initialDepartments: Department[] = [
    { name: "Ingeniería" },
    { name: "Diseño" },
    { name: "Marketing" },
];

export default function PerformancePage() {
    const { toast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
    const [objectiveFormData, setObjectiveFormData] = useState<Omit<Objective, 'id'>>({
        title: "", description: "", assigned_to: "", type: "individual", project_id: undefined, is_incentivized: false, incentive_id: undefined, weight: 0, start_date: "", end_date: "",
    });

    // State for objective details view
    const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
    const [objectiveTasks, setObjectiveTasks] = useState<Task[]>([]);
    const [incentiveResult, setIncentiveResult] = useState<{ result: string | number; message: string; } | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const fetchData = async () => {
        try {
            const [objectivesData, incentivesData, projectsData, tasksData] = await Promise.all([
                listObjectives(), listIncentives(), listProjects(), listTasks()
            ]);
            setObjectives(objectivesData);
            setIncentives(incentivesData);
            setProjects(projectsData);
            setTasks(tasksData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos." });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectObjective = async (objective: Objective) => {
        if (selectedObjective?.id === objective.id) {
            setSelectedObjective(null);
            return;
        }
        setIsLoadingDetails(true);
        setSelectedObjective(objective);
        try {
            const [tasksData, incentiveData] = await Promise.all([
                getTasksByObjective(objective.id),
                objective.is_incentivized ? calculateIncentiveForObjective(objective.id) : Promise.resolve(null)
            ]);
            setObjectiveTasks(tasksData);
            setIncentiveResult(incentiveData);
        } catch (error) {
            console.error("Failed to load objective details", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los detalles del objetivo." });
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle || !selectedObjective) return;
        const newTask: Task = {
            id: uuidv4(),
            title: newTaskTitle,
            objective_id: selectedObjective.id,
            completed: false,
            is_incentivized: false,
            incentive_id: undefined,
        };
        try {
            const savedTask = await createTask(newTask);
            setObjectiveTasks(prev => [...prev, savedTask]);
            setTasks(prev => [...prev, savedTask]); // Update global task list as well
            setNewTaskTitle("");
            toast({ title: "Tarea creada", description: "La nueva tarea se ha añadido al objetivo." });
        } catch (error) {
            console.error("Failed to create task", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear la tarea." });
        }
    };

    const handleToggleTask = (taskId: string) => {
        // Optimistic update for better UX, as API doesn't have a PATCH endpoint
        const updateTasks = (tasks: Task[]) => tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setObjectiveTasks(updateTasks);
        setTasks(updateTasks);
    };

    const getObjectiveProgress = (objectiveId: string) => {
        const relevantTasks = tasks.filter(t => t.objective_id === objectiveId);
        if (relevantTasks.length === 0) return { progress: 0, completed: 0, total: 0 };
        const completedTasks = relevantTasks.filter(t => t.completed);
        const progress = (completedTasks.length / relevantTasks.length) * 100;
        return { progress, completed: completedTasks.length, total: relevantTasks.length };
    };

    const handleOpenAddObjectiveDialog = () => {
        setObjectiveFormData({
            title: "", description: "", assigned_to: "", type: "individual", project_id: undefined, is_incentivized: false, incentive_id: undefined, weight: 0, start_date: "", end_date: "",
        });
        setIsObjectiveDialogOpen(true);
    };

    const handleObjectiveFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {...objectiveFormData};
        if (dataToSave.type === 'empresa') dataToSave.assigned_to = 'Toda la empresa';
        if (!dataToSave.title || !dataToSave.assigned_to) return;
        
        const newObjective: Objective = { id: uuidv4(), ...dataToSave };

        try {
            const savedObjective = await createObjective(newObjective);
            setObjectives(prev => [...prev, savedObjective]);
            setIsObjectiveDialogOpen(false);
            toast({ title: "Objetivo Creado", description: "El nuevo objetivo ha sido guardado." });
        } catch (error) {
            console.error("Failed to create objective:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear el objetivo." });
        }
    };
    
    const getAssignedToName = (objective: Objective) => {
        if (objective.type === 'individual') {
            const employee = employees.find(e => e.id === objective.assigned_to);
            return employee ? employee.name : objective.assigned_to;
        }
        if (objective.type === 'empresa') return "Toda la empresa";
        return objective.assigned_to;
    };
    
    const renderObjectivesTable = (objectivesToShow: Objective[]) => (
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/5">Título del Objetivo</TableHead>
                        <TableHead>Asignado a</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {objectivesToShow.map(objective => {
                        const incentive = incentives.find(i => i.id === objective.incentive_id);
                        const { progress, completed, total } = getObjectiveProgress(objective.id);
                        return (
                            <TableRow key={objective.id} onClick={() => handleSelectObjective(objective)} className="cursor-pointer">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>{objective.title}</span>
                                        {objective.is_incentivized && incentive && (
                                            <Tooltip>
                                                <TooltipTrigger><Gift className="h-4 w-4 text-primary" /></TooltipTrigger>
                                                <TooltipContent><p className="font-semibold">{incentive.name}</p></TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{projects.find(p => p.id === objective.project_id)?.name || ''}</p>
                                </TableCell>
                                <TableCell>{getAssignedToName(objective)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={progress} className="w-24" />
                                        <span className="text-muted-foreground text-xs">{completed}/{total}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {objectivesToShow.length === 0 && (
                <div className="text-center text-muted-foreground py-12"><p>No hay objetivos que mostrar.</p></div>
            )}
        </TooltipProvider>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión del Desempeño</h1>
                <p className="text-muted-foreground">Lanza evaluaciones, establece objetivos y fomenta el feedback continuo.</p>
            </div>

            <Tabs defaultValue="objectives">
                <TabsList>
                    <TabsTrigger value="reviews">Evaluaciones</TabsTrigger>
                    <TabsTrigger value="objectives">Objetivos</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback Continuo</TabsTrigger>
                </TabsList>
                <TabsContent value="reviews">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader><CardTitle>Ciclos de Evaluación</CardTitle></CardHeader>
                        <CardContent><p>Funcionalidad de ciclos de evaluación próximamente.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="objectives">
                     <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Seguimiento de Objetivos</CardTitle>
                                <CardDescription>Visualiza y gestiona los objetivos de la empresa y los equipos.</CardDescription>
                            </div>
                            <Button onClick={handleOpenAddObjectiveDialog}><PlusCircle className="mr-2 h-4 w-4"/> Crear Objetivo</Button>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="all">
                                <TabsList>
                                    <TabsTrigger value="all">Todos</TabsTrigger>
                                    <TabsTrigger value="incentivized">Con Incentivos</TabsTrigger>
                                </TabsList>
                                <TabsContent value="all">{renderObjectivesTable(objectives)}</TabsContent>
                                <TabsContent value="incentivized">{renderObjectivesTable(objectives.filter(o => o.is_incentivized))}</TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedback">
                     <Card className="bg-gradient-accent-to-card">
                        <CardHeader><CardTitle>Feedback Continuo</CardTitle></CardHeader>
                        <CardContent><p>Funcionalidad de feedback próximamente.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedObjective && (
                <Card className="bg-gradient-accent-to-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Detalles: {selectedObjective.title}</CardTitle>
                            <CardDescription>Gestión de tareas e incentivos para el objetivo seleccionado.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedObjective(null)}><X className="h-4 w-4"/></Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingDetails ? (
                            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold mb-2">Tareas Asociadas</h3>
                                    <div className="space-y-2">
                                        {objectiveTasks.map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-2 rounded-lg border bg-background">
                                                <label htmlFor={`task-${task.id}`} className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => handleToggleTask(task.id)}/>
                                                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                                                </label>
                                                {task.completed && <Badge variant="active" className="text-xs">Completado</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Input placeholder="Título de la nueva tarea..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                                        <Button onClick={handleCreateTask}>Añadir</Button>
                                    </div>
                                </div>
                                {selectedObjective.is_incentivized && (
                                <div>
                                    <h3 className="font-semibold mb-2">Resultado del Incentivo</h3>
                                    {incentiveResult ? (
                                        <Card className="bg-background">
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Estado:</span>
                                                    <span>{incentiveResult.message}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-lg text-primary">
                                                    <span>Valor:</span>
                                                    <span>{incentiveResult.result}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No se pudo cargar el incentivo.</p>
                                    )}
                                </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Crear Nuevo Objetivo</DialogTitle></DialogHeader>
                    <form onSubmit={handleObjectiveFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="objective-title">Título del Objetivo</Label>
                                <Input id="objective-title" value={objectiveFormData.title} onChange={(e) => setObjectiveFormData({...objectiveFormData, title: e.target.value})} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="objective-description">Descripción</Label>
                                <Textarea id="objective-description" value={objectiveFormData.description} onChange={(e) => setObjectiveFormData({...objectiveFormData, description: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objective-type">Tipo</Label>
                                    <Select value={objectiveFormData.type} onValueChange={(value: any) => setObjectiveFormData({...objectiveFormData, type: value, assigned_to: ''})}>
                                        <SelectTrigger id="objective-type"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="equipo">Equipo</SelectItem>
                                            <SelectItem value="empresa">Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="objective-assignee">Asignar a</Label>
                                    {objectiveFormData.type === 'individual' && (
                                        <Select value={objectiveFormData.assigned_to} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, assigned_to: value})}>
                                            <SelectTrigger id="objective-assignee"><SelectValue placeholder="Seleccionar empleado"/></SelectTrigger>
                                            <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {objectiveFormData.type === 'equipo' && (
                                        <Select value={objectiveFormData.assigned_to} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, assigned_to: value})}>
                                            <SelectTrigger id="objective-assignee"><SelectValue placeholder="Seleccionar depto."/></SelectTrigger>
                                            <SelectContent>{departments.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {objectiveFormData.type === 'empresa' && <Input id="objective-assignee" value="Toda la empresa" disabled/>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objective-project">Proyecto (Opcional)</Label>
                                    <Select value={objectiveFormData.project_id} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, project_id: value})}>
                                        <SelectTrigger id="objective-project"><SelectValue placeholder="Vincular a proyecto"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Sin proyecto</SelectItem>
                                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="objective-weight">Peso (%)</Label>
                                    <Input id="objective-weight" type="number" value={objectiveFormData.weight} onChange={(e) => setObjectiveFormData({...objectiveFormData, weight: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objective-start">Fecha de Inicio</Label>
                                    <Input id="objective-start" type="date" value={objectiveFormData.start_date} onChange={(e) => setObjectiveFormData({...objectiveFormData, start_date: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="objective-end">Fecha de Fin</Label>
                                    <Input id="objective-end" type="date" value={objectiveFormData.end_date} onChange={(e) => setObjectiveFormData({...objectiveFormData, end_date: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="is_incentivized" checked={objectiveFormData.is_incentivized} onCheckedChange={(checked) => setObjectiveFormData({...objectiveFormData, is_incentivized: checked, incentive_id: undefined})} />
                                <Label htmlFor="is_incentivized">Este objetivo está incentivado</Label>
                            </div>
                            {objectiveFormData.is_incentivized && (
                                <div className="space-y-2">
                                    <Label htmlFor="objective-incentive">Incentivo</Label>
                                    <Select value={objectiveFormData.incentive_id} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, incentive_id: value === 'none' ? undefined : value})}>
                                        <SelectTrigger id="objective-incentive"><SelectValue placeholder="Seleccionar incentivo"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin incentivo</SelectItem>
                                            {incentives.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
