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
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

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

type Goal = {
  id: number;
  name: string;
  description: string;
  assignee: string; // Employee Name
  type: 'Individual' | 'Equipo' | 'Empresa';
  metricType: 'Porcentaje' | 'Numérico';
  targetValue: number;
  currentValue: number;
  status: 'Pendiente' | 'En Progreso' | 'Completado';
};

const EMPLOYEES_STORAGE_KEY = 'workflow-central-employees';
const GOALS_STORAGE_KEY = 'workflow-central-goals';

export default function PerformancePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [dialogGoalMode, setDialogGoalMode] = useState<'add' | 'edit'>('add');
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [goalFormData, setGoalFormData] = useState<Omit<Goal, 'id' | 'status' | 'currentValue'>>({
        name: "",
        description: "",
        assignee: "",
        type: "Individual",
        metricType: "Porcentaje",
        targetValue: 100,
    });


    useEffect(() => {
        try {
            const storedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
            if (storedEmployees) setEmployees(JSON.parse(storedEmployees));

            const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
            if (storedGoals) setGoals(JSON.parse(storedGoals));
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        } catch (error) {
            console.error("Failed to save goals to localStorage", error);
        }
    }, [goals]);


    const getStatusVariant = (status: string) => {
      switch (status) {
        case "Completado": return "active";
        case "En Progreso": return "warning";
        case "Programado": return "secondary";
        default: return "default";
      }
    };
    
    const getGoalStatus = (current: number, target: number): Goal['status'] => {
        if (current >= target) return "Completado";
        if (current > 0) return "En Progreso";
        return "Pendiente";
    }

    const calculateProgress = (current: number, target: number) => {
        if (target === 0) return 0;
        return (current / target) * 100;
    }

    const handleOpenAddGoalDialog = () => {
        setDialogGoalMode('add');
        setSelectedGoal(null);
        setGoalFormData({
            name: "", description: "", assignee: "", type: "Individual", metricType: "Porcentaje", targetValue: 100,
        });
        setIsGoalDialogOpen(true);
    }
    
    const handleOpenEditGoalDialog = (goal: Goal) => {
        setDialogGoalMode('edit');
        setSelectedGoal(goal);
        setGoalFormData({
            name: goal.name,
            description: goal.description,
            assignee: goal.assignee,
            type: goal.type,
            metricType: goal.metricType,
            targetValue: goal.targetValue,
        });
        setIsGoalDialogOpen(true);
    };

    const handleGoalFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetValue = Number(goalFormData.targetValue);
        if (!goalFormData.name || !goalFormData.assignee || isNaN(targetValue)) return;
        
        if (dialogGoalMode === 'add') {
            const newGoal: Goal = {
                id: Date.now(),
                ...goalFormData,
                targetValue,
                currentValue: 0,
                status: "Pendiente",
            };
            setGoals(prev => [...prev, newGoal]);
        } else if (selectedGoal) {
            setGoals(prev => prev.map(g => g.id === selectedGoal.id ? { ...g, ...goalFormData, targetValue, status: getGoalStatus(g.currentValue, targetValue) } : g));
        }
        setIsGoalDialogOpen(false);
    };

    const handleDeleteGoal = (goalId: number) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
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
                            <Button onClick={handleOpenAddGoalDialog}><PlusCircle className="mr-2 h-4 w-4"/> Crear Objetivo</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/5">Nombre del Objetivo</TableHead>
                                        <TableHead>Asignado a</TableHead>
                                        <TableHead>Progreso</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {goals.map(goal => {
                                        const progress = calculateProgress(goal.currentValue, goal.targetValue);
                                        const status = getGoalStatus(goal.currentValue, goal.targetValue);
                                        return (
                                            <TableRow key={goal.id}>
                                                <TableCell className="font-medium">{goal.name}</TableCell>
                                                <TableCell>{goal.assignee}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={progress} className="w-full" />
                                                        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant={getStatusVariant(status)}>{status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleOpenEditGoalDialog(goal)}>Editar</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteGoal(goal.id)}>Eliminar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                             {goals.length === 0 && (
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
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogGoalMode === 'add' ? 'Crear Nuevo Objetivo' : 'Editar Objetivo'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGoalFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="goal-name">Nombre del Objetivo</Label>
                                <Input id="goal-name" value={goalFormData.name} onChange={(e) => setGoalFormData({...goalFormData, name: e.target.value})} required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="goal-description">Descripción</Label>
                                <Textarea id="goal-description" value={goalFormData.description} onChange={(e) => setGoalFormData({...goalFormData, description: e.target.value})} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goal-assignee">Asignar a</Label>
                                    <Select value={goalFormData.assignee} onValueChange={(value) => setGoalFormData({...goalFormData, assignee: value})}>
                                        <SelectTrigger id="goal-assignee"><SelectValue placeholder="Seleccionar empleado"/></SelectTrigger>
                                        <SelectContent>
                                            {employees.map(e => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="goal-type">Tipo</Label>
                                    <Select value={goalFormData.type} onValueChange={(value: any) => setGoalFormData({...goalFormData, type: value})}>
                                        <SelectTrigger id="goal-type"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Individual">Individual</SelectItem>
                                            <SelectItem value="Equipo">Equipo</SelectItem>
                                            <SelectItem value="Empresa">Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goal-metric">Métrica</Label>
                                    <Select value={goalFormData.metricType} onValueChange={(value: any) => setGoalFormData({...goalFormData, metricType: value})}>
                                        <SelectTrigger id="goal-metric"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Porcentaje">Porcentaje</SelectItem>
                                            <SelectItem value="Numérico">Numérico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="goal-target">Valor Objetivo</Label>
                                    <Input id="goal-target" type="number" value={goalFormData.targetValue} onChange={(e) => setGoalFormData({...goalFormData, targetValue: Number(e.target.value)})} />
                                </div>
                            </div>
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
