
'use client'

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, X, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { type Objective, type Task, type Incentive, type Project, type Department, type Employee, listObjectives, listTasks, listIncentives, listProjects, createObjective, calculateIncentiveForObjective, createTask } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, addMonths } from "date-fns";


const initialEmployees: (Employee & { id: string })[] = [
  { id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", name: "Olivia Martin", email: "olivia.martin@example.com", department: "Ingeniería", role: "Frontend Developer", status: "Activo", schedule: "9-5", avatar: "OM", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown" },
  { id: "b2c3d4e5-f6a7-8901-2345-67890abcdef1", name: "Jackson Lee", email: "jackson.lee@example.com", department: "Diseño", role: "UI/UX Designer", status: "Activo", schedule: "9-5", avatar: "JL", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown" },
  { id: "c3d4e5f6-a7b8-9012-3456-7890abcdef2", name: "Isabella Nguyen", email: "isabella.nguyen@example.com", department: "Marketing", role: "Marketing Manager", status: "Activo", schedule: "9-5", avatar: "IN", workCenter: "Remoto", vacationManager: "Noah Brown", clockInManager: "Noah Brown" },
  { id: "d4e5f6a7-b8c9-0123-4567-890abcdef3", name: "William Kim", email: "william.kim@example.com", department: "Ingeniería", role: "Backend Developer", status: "Activo", schedule: "9-5", avatar: "WK", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown" },
  { id: "e5f6a7b8-c9d0-1234-5678-90abcdef4", name: "Sophia Davis", email: "sophia.davis@example.com", department: "Ventas", role: "Sales Associate", status: "Activo", schedule: "9-5", avatar: "SD", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown" },
];

const initialDepartments: (Department & { id: string })[] = [
    { id: "de01f2b3-a4b5-c6d7-e8f9-1234567890ab", name: "Ingeniería" },
    { id: "de01f2b3-a4b5-c6d7-e8f9-1234567890ac", name: "Diseño" },
    { id: "de01f2b3-a4b5-c6d7-e8f9-1234567890ad", name: "Marketing" },
    { id: "de01f2b3-a4b5-c6d7-e8f9-1234567890ae", name: "Ventas" },
    { id: "de01f2b3-a4b5-c6d7-e8f9-1234567890af", name: "RRHH" },
];


export default function PerformancePage() {
    const { toast } = useToast();
    const [employees, setEmployees] = useState<(Employee & { id: string })[]>(initialEmployees);
    const [departments, setDepartments] = useState<(Department & { id: string })[]>(initialDepartments);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [newObjectiveData, setNewObjectiveData] = useState<Omit<Objective, 'id'>>({
        title: "",
        description: "",
        type: "individual",
        assigned_to: "",
        project_id: "",
        is_incentivized: false,
        incentive_id: "",
        weight: 0,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    });

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

    const getTasksByObjective = (objectiveId: string) => {
        return tasks.filter(task => task.objective_id === objectiveId);
    };

    const handleSelectObjective = async (objective: Objective) => {
        if (selectedObjective?.id === objective.id) {
            setSelectedObjective(null);
            return;
        }
        setIsLoadingDetails(true);
        setSelectedObjective(objective);
        try {
            const tasksData = getTasksByObjective(objective.id);
            const incentiveData = objective.is_incentivized
                ? await calculateIncentiveForObjective(objective.id)
                : null;

            setObjectiveTasks(tasksData);
            setIncentiveResult(incentiveData);
        } catch (error) {
            console.error("Failed to load objective details", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los detalles del objetivo." });
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCreateObjective = async (e: React.FormEvent) => {
        e.preventDefault();

        let assignedTo = newObjectiveData.assigned_to;
        if (newObjectiveData.type === 'empresa') {
            assignedTo = '00000000-0000-0000-0000-000000000000';
        }

        if (!newObjectiveData.title || !assignedTo) {
             toast({ variant: "destructive", title: "Error", description: "El título y el campo 'Asignar a' son obligatorios." });
             return;
        }
        
        const newObjective: Omit<Objective, 'id'> = {
            title: newObjectiveData.title,
            description: newObjectiveData.description || undefined,
            type: newObjectiveData.type,
            assigned_to: assignedTo,
            project_id: newObjectiveData.project_id || undefined,
            is_incentivized: newObjectiveData.is_incentivized,
            incentive_id: newObjectiveData.incentive_id || undefined,
            weight: newObjectiveData.weight || undefined,
            start_date: newObjectiveData.start_date,
            end_date: newObjectiveData.end_date,
        };

        try {
            const savedObjective = await createObjective({ id: uuidv4(), ...newObjective });
            setObjectives(prev => [...prev, savedObjective]);
            toast({ title: "Objetivo Creado", description: "El nuevo objetivo ha sido guardado." });
            setNewObjectiveData({
                title: "",
                description: "",
                type: "individual",
                assigned_to: "",
                project_id: "",
                is_incentivized: false,
                incentive_id: "",
                weight: 0,
                start_date: format(new Date(), 'yyyy-MM-dd'),
                end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
            });
        } catch (error) {
            console.error("Failed to create objective:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear el objetivo." });
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
            setTasks(prev => [...prev, savedTask]);
            setNewTaskTitle("");
            toast({ title: "Tarea creada", description: "La nueva tarea se ha añadido al objetivo." });
        } catch (error) {
            console.error("Failed to create task", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo crear la tarea." });
        }
    };
    
    const handleToggleTask = (taskId: string, completed: boolean) => {
        // NOTE: The provided API does not have an endpoint to update a task.
        // This update is only reflected in the local state for a better UX.
        // In a real application, this should be a PATCH/PUT request to the backend.
        const updateTasks = (tasks: Task[]) => tasks.map(t =>
            t.id === taskId ? { ...t, completed: completed } : t
        );
        setObjectiveTasks(updateTasks);
        setTasks(updateTasks);
    };

    const getAssignedToName = (objective: Objective) => {
        if (objective.type === 'individual') {
            const employee = employees.find(e => e.id === objective.assigned_to);
            return employee ? employee.name : "Empleado no encontrado";
        }
         if (objective.type === 'equipo') {
            const department = departments.find(d => d.id === objective.assigned_to);
            return department ? department.name : "Equipo no encontrado";
        }
        if (objective.type === 'empresa') return "Toda la empresa";
        return "Desconocido";
    };
    
    const getObjectiveProgress = (objectiveId: string) => {
        const relevantTasks = tasks.filter(t => t.objective_id === objectiveId);
        if (relevantTasks.length === 0) return { progress: 0, completed: 0, total: 0 };
        const completedTasks = relevantTasks.filter(t => t.completed);
        const progress = (completedTasks.length / relevantTasks.length) * 100;
        return { progress, completed: completedTasks.length, total: relevantTasks.length };
    };

    const renderObjectiveCards = (objectivesToShow: Objective[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectivesToShow.map(obj => {
                 const { progress } = getObjectiveProgress(obj.id);
                 return (
                    <Card key={obj.id} className="bg-gradient-accent-to-card flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>{obj.title}</span>
                                {obj.is_incentivized && (
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger><Gift className="h-4 w-4 text-primary" /></TooltipTrigger>
                                            <TooltipContent><p>Incentivado</p></TooltipContent>
                                        </Tooltip>
                                     </TooltipProvider>
                                )}
                            </CardTitle>
                            <CardDescription>{obj.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <p><strong>Asignado a:</strong> {getAssignedToName(obj)}</p>
                                <div><strong>Tipo:</strong> <Badge variant="outline">{obj.type}</Badge></div>
                            </div>
                            <div>
                                <Label>Progreso</Label>
                                <Progress value={progress} className="h-2 mt-1" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleSelectObjective(obj)}>
                                Ver Detalles
                            </Button>
                        </CardFooter>
                    </Card>
                 )
            })}
             {objectivesToShow.length === 0 && (
                <div className="text-center text-muted-foreground py-12 col-span-full"><p>No hay objetivos que mostrar.</p></div>
            )}
        </div>
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión del Desempeño</h1>
                <p className="text-muted-foreground">Lanza evaluaciones, establece objetivos y fomenta el feedback continuo.</p>
            </div>

            <Tabs defaultValue="all">
                <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="incentivized">Con Incentivos</TabsTrigger>
                    <TabsTrigger value="create">Crear Objetivo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                    {renderObjectiveCards(objectives)}
                </TabsContent>
                
                <TabsContent value="incentivized" className="mt-6">
                    {renderObjectiveCards(objectives.filter(o => o.is_incentivized))}
                </TabsContent>
                
                <TabsContent value="create" className="mt-6">
                    <Card className="max-w-2xl mx-auto bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Crear Nuevo Objetivo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateObjective} className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="objective-title">Título del Objetivo</Label>
                                    <Input id="objective-title" value={newObjectiveData.title} onChange={(e) => setNewObjectiveData({...newObjectiveData, title: e.target.value})} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="objective-description">Descripción</Label>
                                    <Textarea id="objective-description" value={newObjectiveData.description || ''} onChange={(e) => setNewObjectiveData({...newObjectiveData, description: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="objective-type">Tipo</Label>
                                        <Select value={newObjectiveData.type} onValueChange={(value: any) => setNewObjectiveData({...newObjectiveData, type: value, assigned_to: ''})}>
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
                                        {newObjectiveData.type === 'individual' && (
                                            <Select value={newObjectiveData.assigned_to} onValueChange={(value) => setNewObjectiveData({...newObjectiveData, assigned_to: value})}>
                                                <SelectTrigger id="objective-assignee"><SelectValue placeholder="Seleccionar empleado"/></SelectTrigger>
                                                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )}
                                        {newObjectiveData.type === 'equipo' && (
                                            <Select value={newObjectiveData.assigned_to} onValueChange={(value) => setNewObjectiveData({...newObjectiveData, assigned_to: value})}>
                                                <SelectTrigger id="objective-assignee"><SelectValue placeholder="Seleccionar depto."/></SelectTrigger>
                                                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )}
                                        {newObjectiveData.type === 'empresa' && <Input id="objective-assignee" value="Toda la empresa" disabled/>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="objective-start-date">Fecha de Inicio</Label>
                                        <Input id="objective-start-date" type="date" value={newObjectiveData.start_date} onChange={(e) => setNewObjectiveData({...newObjectiveData, start_date: e.target.value})} required/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="objective-end-date">Fecha de Fin</Label>
                                        <Input id="objective-end-date" type="date" value={newObjectiveData.end_date} onChange={(e) => setNewObjectiveData({...newObjectiveData, end_date: e.target.value})} required/>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="objective-project">Proyecto (Opcional)</Label>
                                        <Select value={newObjectiveData.project_id} onValueChange={(value) => setNewObjectiveData({...newObjectiveData, project_id: value === 'none' ? '' : value})}>
                                            <SelectTrigger id="objective-project"><SelectValue placeholder="Asociar a un proyecto"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Sin proyecto</SelectItem>
                                                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="objective-weight">Peso del Objetivo (%)</Label>
                                        <Input id="objective-weight" type="number" value={newObjectiveData.weight || ''} onChange={(e) => setNewObjectiveData({...newObjectiveData, weight: Number(e.target.value)})} placeholder="Ej. 20" />
                                    </div>
                                 </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch id="is_incentivized" checked={newObjectiveData.is_incentivized} onCheckedChange={(checked) => setNewObjectiveData({...newObjectiveData, is_incentivized: checked, incentive_id: ""})} />
                                    <Label htmlFor="is_incentivized">Este objetivo está incentivado</Label>
                                </div>
                                {newObjectiveData.is_incentivized && (
                                    <div className="space-y-2">
                                        <Label htmlFor="objective-incentive">Incentivo</Label>
                                        <Select value={newObjectiveData.incentive_id} onValueChange={(value) => setNewObjectiveData({...newObjectiveData, incentive_id: value === 'none' ? '' : value})}>
                                            <SelectTrigger id="objective-incentive"><SelectValue placeholder="Seleccionar incentivo"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Sin incentivo</SelectItem>
                                                {incentives.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <Button type="submit" className="w-full">Crear Objetivo</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedObjective && (
                <Card className="bg-gradient-accent-to-card mt-8">
                    <CardHeader className="flex flex-row items-start justify-between">
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
                                    <h3 className="font-semibold mb-4">Tareas Asociadas</h3>
                                    <div className="space-y-2 mb-4">
                                        {objectiveTasks.map(task => (
                                            <div key={task.id} className="flex items-center p-2 rounded-lg border bg-background">
                                                <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)} className="mr-2"/>
                                                <label htmlFor={`task-${task.id}`} className={cn("flex-1 cursor-pointer", task.completed ? 'line-through text-muted-foreground' : '')}>{task.title}</label>
                                            </div>
                                        ))}
                                         {objectiveTasks.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">No hay tareas para este objetivo.</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input placeholder="Título de la nueva tarea..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                                        <Button onClick={handleCreateTask}>Añadir</Button>
                                    </div>
                                </div>
                                {selectedObjective.is_incentivized && (
                                <div>
                                    <h3 className="font-semibold mb-4">Resultado del Incentivo</h3>
                                    {incentiveResult ? (
                                        <Card className="bg-background">
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Estado:</span>
                                                    <span>{incentiveResult.message}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-lg text-primary">
                                                    <span>Valor:</span>
                                                    <span>{typeof incentiveResult.result === 'number' ? `€${incentiveResult.result.toFixed(2)}` : incentiveResult.result}</span>
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
        </div>
    )
}
