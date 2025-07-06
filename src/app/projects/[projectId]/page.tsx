'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, PlusCircle, Gift } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


type Project = {
    id: string;
    name: string;
    description: string;
};

type Objective = {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'equipo' | 'empresa';
  assigned_to: string;
  project_id: string;
  is_incentivized: boolean;
  incentive_id?: string;
  weight?: number;
};

type Task = {
  id: string;
  title: string;
  objective_id: string;
  completed: boolean;
};

type Incentive = {
  id: string;
  name: string;
  type: string;
  value: string | number;
};


const PROJECTS_STORAGE_KEY = 'workflow-central-projects';
const OBJECTIVES_STORAGE_KEY = 'workflow-central-objectives';
const TASKS_STORAGE_KEY = 'workflow-central-tasks';
const INCENTIVES_STORAGE_KEY = 'workflow-central-incentives';

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [projects, setProjects] = useState<Project[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);

    const [isClient, setIsClient] = useState(false);
    const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
                if (storedProjects) setProjects(JSON.parse(storedProjects));

                const storedObjectives = localStorage.getItem(OBJECTIVES_STORAGE_KEY);
                if (storedObjectives) setObjectives(JSON.parse(storedObjectives));

                const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
                if (storedTasks) setTasks(JSON.parse(storedTasks));
                
                const storedIncentives = localStorage.getItem(INCENTIVES_STORAGE_KEY);
                if (storedIncentives) setIncentives(JSON.parse(storedIncentives));


            } catch (error) {
                console.error("Failed to load data from localStorage", error);
            }
        }
    }, [isClient]);
    
    const project = projects.find(p => p.id.toString() === projectId);
    const projectObjectives = objectives.filter(o => o.project_id === projectId);

    const handleAddObjective = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Logic to add a new objective would go here
        setIsObjectiveDialogOpen(false);
    }

    const getObjectiveProgress = (objectiveId: string) => {
        const relevantTasks = tasks.filter(t => t.objective_id === objectiveId);
        if (relevantTasks.length === 0) return { progress: 0, completed: 0, total: 0 };

        const completedTasks = relevantTasks.filter(t => t.completed);
        const progress = (completedTasks.length / relevantTasks.length) * 100;
        return { progress, completed: completedTasks.length, total: relevantTasks.length };
    };
    
    if (!isClient) {
        return <div className="p-8">Cargando proyecto...</div>;
    }

    if (!project) {
        return <div className="p-8">Proyecto no encontrado.</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/projects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Proyectos
                    </Link>
                </Button>
                <Card className="bg-gradient-accent-to-card">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-3xl">{project.name}</CardTitle>
                                <CardDescription className="text-lg mt-2">{project.description}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/> Editar Proyecto</Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>
            
             <Card className="bg-gradient-accent-to-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>Objetivos del Proyecto</CardTitle>
                    <CardDescription>Seguimiento de todos los objetivos asociados al proyecto.</CardDescription>
                    </div>
                    <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4"/> Nuevo Objetivo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Añadir Nuevo Objetivo al Proyecto</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddObjective}>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="objectiveName">Título del Objetivo</Label>
                                        <Input id="objectiveName" name="objectiveName" placeholder="Ej. Aumentar conversión un 10%"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="objectiveDescription">Descripción</Label>
                                        <Textarea id="objectiveDescription" name="objectiveDescription" placeholder="Describe el objetivo..."/>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Añadir Objetivo</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Objetivo</TableHead>
                                <TableHead>Asignado a</TableHead>
                                <TableHead>Progreso</TableHead>
                                <TableHead className="text-right">Peso</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectObjectives.map(obj => {
                                const { progress, completed, total } = getObjectiveProgress(obj.id);
                                const incentive = incentives.find(i => i.id === obj.incentive_id);
                                return (
                                <TableRow key={obj.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {obj.title}
                                            {obj.is_incentivized && incentive && (
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
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{obj.assigned_to}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={progress} className="w-24" />
                                            <span className="text-muted-foreground text-xs">{completed}/{total}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{obj.weight ? `${obj.weight}%` : '-'}</TableCell>
                                </TableRow>
                            )})}
                            {projectObjectives.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No hay objetivos para este proyecto.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </TooltipProvider>
                </CardContent>
            </Card>
        </div>
    )
}
