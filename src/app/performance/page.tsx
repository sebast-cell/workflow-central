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

const reviewCycles = [
  { name: "Revisión Anual 2024", status: "Completado", period: "01 Ene - 31 Dic, 2024", participants: 48 },
  { name: "Check-in Q3 2024", status: "En Progreso", period: "01 Jul - 30 Sep, 2024", participants: 50 },
  { name: "Evaluación de Nuevas Incorporaciones", status: "Programado", period: "01 Oct - 31 Oct, 2024", participants: 4 },
];

type Employee = {
    id: number;
    name: string;
    email: string;
};

type Objective = {
  id: string; // UUID
  title: string;
  description: string;
  type: 'individual' | 'equipo' | 'empresa';
  assigned_to: string; // UserID or TeamID
  project_id?: string; // UUID (nullable)
  is_incentivized: boolean;
  incentive_id?: string; // UUID (nullable)
  weight?: number; // decimal
  start_date?: string; // date
  end_date?: string; // date
};

type Incentive = {
  id: string;
  name: string;
  type: 'Económico' | 'Días libres' | 'Formación' | 'Personalizado';
  details: string; 
};

type Project = {
    id: string;
    name: string;
    description: string;
}

const EMPLOYEES_STORAGE_KEY = 'workflow-central-employees';
const OBJECTIVES_STORAGE_KEY = 'workflow-central-objectives';
const INCENTIVES_STORAGE_KEY = 'workflow-central-incentives';
const PROJECTS_STORAGE_KEY = 'workflow-central-projects';

export default function PerformancePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);


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


    useEffect(() => {
        try {
            const storedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
            if (storedEmployees) setEmployees(JSON.parse(storedEmployees));

            const storedObjectives = localStorage.getItem(OBJECTIVES_STORAGE_KEY);
            if (storedObjectives) setObjectives(JSON.parse(storedObjectives));

            const storedIncentives = localStorage.getItem(INCENTIVES_STORAGE_KEY);
            if (storedIncentives) setIncentives(JSON.parse(storedIncentives));
            
            const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if(storedProjects) setProjects(JSON.parse(storedProjects));

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(OBJECTIVES_STORAGE_KEY, JSON.stringify(objectives));
        } catch (error) {
            console.error("Failed to save objectives to localStorage", error);
        }
    }, [objectives]);


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
    
    const handleOpenEditObjectiveDialog = (objective: Objective) => {
        setDialogObjectiveMode('edit');
        setSelectedObjective(objective);
        setObjectiveFormData({
            title: objective.title,
            description: objective.description,
            assigned_to: objective.assigned_to,
            type: objective.type,
            project_id: objective.project_id,
            is_incentivized: objective.is_incentivized,
            incentive_id: objective.incentive_id,
            weight: objective.weight,
            start_date: objective.start_date,
            end_date: objective.end_date,
        });
        setIsObjectiveDialogOpen(true);
    };

    const handleObjectiveFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!objectiveFormData.title || !objectiveFormData.assigned_to) return;
        
        if (dialogObjectiveMode === 'add') {
            const newObjective: Objective = {
                id: Date.now().toString(),
                ...objectiveFormData,
            };
            setObjectives(prev => [...prev, newObjective]);
        } else if (selectedObjective) {
            setObjectives(prev => prev.map(g => g.id === selectedObjective.id ? { ...g, ...objectiveFormData } : g));
        }
        setIsObjectiveDialogOpen(false);
    };

    const handleDeleteObjective = (objectiveId: string) => {
        setObjectives(prev => prev.filter(g => g.id !== objectiveId));
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión del Desempeño</h1>
                <p className="text-muted-foreground">Lanza evaluaciones, establece objetivos y fomenta el feedback continuo.</p>
            </div>

            <Tabs defaultValue="goals">
                <TabsList>
                    <TabsTrigger value="reviews">Evaluaciones</TabsTrigger>
                    <TabsTrigger value="goals">Objetivos</TabsTrigger>
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
                <TabsContent value="goals">
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
                                        <TableHead>Proyecto</TableHead>
                                        <TableHead>Peso</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {objectives.map(objective => {
                                        const incentive = incentives.find(i => i.id === objective.incentive_id);
                                        const project = projects.find(p => p.id === objective.project_id);
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
                                                                    <p>{incentive.type}: {incentive.details}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{objective.assigned_to}</TableCell>
                                                <TableCell>{project?.name || '-'}</TableCell>
                                                <TableCell>{objective.weight || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleOpenEditObjectiveDialog(objective)}>Editar</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteObjective(objective.id)}>Eliminar</DropdownMenuItem>
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
                                    <Label htmlFor="objective-assignee">Asignar a</Label>
                                    <Select value={objectiveFormData.assigned_to} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, assigned_to: value})}>
                                        <SelectTrigger id="objective-assignee"><SelectValue placeholder="Seleccionar empleado"/></SelectTrigger>
                                        <SelectContent>
                                            {employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="objective-type">Tipo</Label>
                                    <Select value={objectiveFormData.type} onValueChange={(value: any) => setObjectiveFormData({...objectiveFormData, type: value})}>
                                        <SelectTrigger id="objective-type"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="equipo">Equipo</SelectItem>
                                            <SelectItem value="empresa">Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="objective-project">Proyecto (Opcional)</Label>
                                    <Select value={objectiveFormData.project_id} onValueChange={(value) => setObjectiveFormData({...objectiveFormData, project_id: value})}>
                                        <SelectTrigger id="objective-project"><SelectValue placeholder="Vincular a proyecto"/></SelectTrigger>
                                        <SelectContent>
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
