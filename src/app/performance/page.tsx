'use client'

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, PlusCircle, Gift, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { type Objective, type Task, type Incentive, type Project, type Department, type Employee, listObjectives, listTasks, listIncentives, listProjects, createObjective } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';

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

const calculateIncentive = (objective: Objective, allTasks: Task[], allIncentives: Incentive[]) => {
    if (!objective.is_incentivized || !objective.incentive_id) {
        return 'N/A';
    }

    const incentive = allIncentives.find(i => i.id === objective.incentive_id);
    if (!incentive) {
        return 'N/A';
    }
    
    const objectiveTasks = allTasks.filter(t => t.objective_id === objective.id);
    const totalTasks = objectiveTasks.length;
    if (totalTasks === 0) {
        return incentive.type === 'económico' ? '€0.00' : '0 Tareas';
    }

    const completedTasks = objectiveTasks.filter(t => t.completed).length;
    const completionRatio = completedTasks / totalTasks;
    
    let calculatedAmount = 0;
    let rawIncentiveValue: number | string = incentive.value;

    if (incentive.type === 'económico' || incentive.type === 'días_libres') {
        const numericValue = parseFloat(String(incentive.value).replace(/[^0-9.-]+/g,""));
        if (isNaN(numericValue)) return 'Valor Inválido';
        rawIncentiveValue = numericValue;
    }

    if (typeof rawIncentiveValue === 'number') {
        if (completionRatio >= 1) {
            calculatedAmount = rawIncentiveValue;
        } else if (completionRatio >= 0.75) {
            calculatedAmount = rawIncentiveValue * 0.75;
        }
    }

    switch (incentive.type) {
        case 'económico':
            return `€${calculatedAmount.toFixed(2)}`;
        case 'días_libres':
            if (calculatedAmount === 0) return 'No alcanzado';
            return `${calculatedAmount} ${calculatedAmount === 1 ? 'día' : 'días'}`;
        case 'formación':
        case 'otro':
             return completionRatio >= 1 ? String(incentive.value) : 'No alcanzado';
        default:
            return 'N/A';
    }
}


export default function PerformancePage() {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);


    const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
    const [dialogObjectiveMode, setDialogObjectiveMode] = useState<'add' | 'edit'>('add');
    const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
    const [objectiveFormData, setObjectiveFormData] = useState<Omit<Objective, 'id'>>({
        title: "",
        description: "",
        assigned_to: "",
        type: "individual",
        project_id: undefined,
        is_incentivized: false,
        incentive_id: undefined,
        weight: 0,
        start_date: "",
        end_date: "",
    });

    const fetchData = async () => {
        try {
            const [objectivesData, tasksData, incentivesData, projectsData] = await Promise.all([
                listObjectives(),
                listTasks(),
                listIncentives(),
                listProjects()
            ]);
            setObjectives(objectivesData);
            setTasks(tasksData);
            setIncentives(incentivesData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusVariant = (status: string) => {
      switch (status) {
        case "Completado": return "active";
        case "En Progreso": return "warning";
        case "Programado": return "secondary";
        case "Pendiente": return "secondary";
        default: return "default";
      }
    };
    
    const handleOpenAddObjectiveDialog = () => {
        setDialogObjectiveMode('add');
        setSelectedObjective(null);
        setObjectiveFormData({
            title: "", description: "", assigned_to: "", type: "individual", project_id: undefined, is_incentivized: false, incentive_id: undefined, weight: 0, start_date: "", end_date: "",
        });
        setIsObjectiveDialogOpen(true);
    }
    
    const handleObjectiveFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = {...objectiveFormData};
        if (dataToSave.type === 'empresa') {
            dataToSave.assigned_to = 'Toda la empresa';
        }
        
        if (!dataToSave.title || !dataToSave.assigned_to) return;
        
        const newObjective: Objective = {
            id: uuidv4(),
            ...dataToSave,
        };

        try {
            const savedObjective = await createObjective(newObjective);
            setObjectives(prev => [...prev, savedObjective]);
            setIsObjectiveDialogOpen(false);
        } catch (error) {
            console.error("Failed to create objective:", error);
        }
    };

    const getObjectiveProgress = (objectiveId: string) => {
        const relevantTasks = tasks.filter(t => t.objective_id === objectiveId);
        if (relevantTasks.length === 0) return { progress: 0, completed: 0, total: 0 };

        const completedTasks = relevantTasks.filter(t => t.completed);
        const progress = (completedTasks.length / relevantTasks.length) * 100;
        return { progress, completed: completedTasks.length, total: relevantTasks.length };
    };

    const getAssignedToName = (objective: Objective) => {
        if (objective.type === 'individual') {
            const employee = employees.find(e => e.id === objective.assigned_to);
            return employee ? employee.name : objective.assigned_to;
        }
        if (objective.type === 'empresa') {
            return "Toda la empresa";
        }
        return objective.assigned_to;
    }


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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Ciclos de Evaluación</CardTitle>
                                <CardDescription>Gestiona y monitoriza todos los ciclos de evaluación de desempeño.</CardDescription>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Lanzar Nuevo Ciclo</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Lanzar Nuevo Ciclo de Evaluación</DialogTitle>
                                        <DialogDescription>Configura los detalles para el nuevo ciclo.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cycle-name">Nombre del Ciclo</Label>
                                            <Input id="cycle-name" placeholder="Ej. Revisión Anual 2025" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cycle-period">Periodo de Evaluación</Label>
                                            <Input id="cycle-period" placeholder="Ej. 01 Ene - 31 Dic, 2025" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="template">Plantilla de Evaluación</Label>
                                            <Select>
                                                <SelectTrigger id="template">
                                                    <SelectValue placeholder="Seleccionar plantilla" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Evaluación Estándar (Manager)</SelectItem>
                                                    <SelectItem value="360">Evaluación 360 (Peers + Manager)</SelectItem>
                                                    <SelectItem value="self">Autoevaluación</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button>Lanzar Ciclo</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ciclo de Evaluación</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Periodo</TableHead>
                                        <TableHead>Participantes</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviewCycles.map((cycle) => (
                                        <TableRow key={cycle.name}>
                                            <TableCell className="font-medium">{cycle.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(cycle.status)}>{cycle.status}</Badge>
                                            </TableCell>
                                            <TableCell>{cycle.period}</TableCell>
                                            <TableCell>{cycle.participants}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                                        <DropdownMenuItem>Finalizar Ciclo</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
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
                           <TooltipProvider>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/5">Título del Objetivo</TableHead>
                                        <TableHead>Asignado a</TableHead>
                                        <TableHead>Progreso</TableHead>
                                        <TableHead>Incentivo Calculado</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {objectives.map(objective => {
                                        const incentive = incentives.find(i => i.id === objective.incentive_id);
                                        const { progress, completed, total } = getObjectiveProgress(objective.id);
                                        const calculatedIncentive = calculateIncentive(objective, tasks, incentives);
                                        return (
                                            <TableRow key={objective.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span>{objective.title}</span>
                                                        {objective.is_incentivized && incentive && (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Gift className="h-4 w-4 text-primary" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-semibold">{incentive.name}</p>
                                                                    <p>{incentive.type}: {incentive.value.toString()}</p>
                                                                </TooltipContent>
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
                                                <TableCell className="font-medium">{calculatedIncentive}</TableCell>
                                                <TableCell className="text-right">
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                           </TooltipProvider>
                             {objectives.length === 0 && (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>No hay objetivos definidos. Empieza por crear uno.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedback">
                     <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Registro de Feedback Continuo</CardTitle>
                            <CardDescription>Un lugar central para el feedback constructivo fuera de los ciclos formales.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="text-center text-muted-foreground py-12">
                                <p>El feedback entre empleados y managers se mostrará aquí.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogObjectiveMode === 'add' ? 'Crear Nuevo Objetivo' : 'Editar Objetivo'}</DialogTitle>
                    </DialogHeader>
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
                                            <SelectContent>
                                                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {objectiveFormData.type === 'equipo' && (
                                        <Select value={objectiveFormData.assigned_to} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, assigned_to: value})}>
                                            <SelectTrigger id="objective-assignee"><SelectValue placeholder="Seleccionar depto."/></SelectTrigger>
                                            <SelectContent>
                                                {departments.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {objectiveFormData.type === 'empresa' && (
                                        <Input id="objective-assignee" value="Toda la empresa" disabled/>
                                    )}
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
                        <DialogFooter>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
