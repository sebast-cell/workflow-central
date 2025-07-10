
'use client';

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, PlusCircle, Gift, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type Project, type Objective, type Task, type Incentive, getAssignedToName, listProjects, listObjectives, listTasks, listIncentives } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailsPage() {
    const { toast } = useToast();
    const params = useParams();
    const projectId = params.projectId as string;
    
    const [project, setProject] = useState<Project | null>(null);
    const [projectObjectives, setProjectObjectives] = useState<Objective[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
    
    useEffect(() => {
        if (!projectId) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // This will be slow if there's a lot of data. In a real app, you'd fetch only what's needed.
                const [allProjects, allObjectives, allTasks, allIncentives] = await Promise.all([
                    listProjects(),
                    listObjectives(),
                    listTasks(),
                    listIncentives()
                ]);
                
                const currentProject = allProjects.find(p => p.id === projectId) || null;
                const objectivesForProject = allObjectives.filter(o => o.project_id === projectId);
                
                setProject(currentProject);
                setProjectObjectives(objectivesForProject);
                setTasks(allTasks); // We need all tasks to calculate progress for any objective
                setIncentives(allIncentives);

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudieron cargar los datos del proyecto.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [projectId, toast]);
    
    const handleAddObjective = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsObjectiveDialogOpen(false);
        toast({ title: "Funcionalidad no implementada", description: "La creación de objetivos desde aquí se añadirá pronto." });
    }

    const getObjectiveProgress = (objectiveId: string) => {
        const relevantTasks = tasks.filter(t => t.objective_id === objectiveId);
        if (relevantTasks.length === 0) return { progress: 0, completed: 0, total: 0 };

        const completedTasks = relevantTasks.filter(t => t.completed);
        const progress = (completedTasks.length / relevantTasks.length) * 100;
        return { progress, completed: completedTasks.length, total: relevantTasks.length };
    };
    
    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-48" />
                <Card className="bg-gradient-accent-to-card">
                    <CardHeader>
                        <Skeleton className="h-9 w-1/2" />
                        <Skeleton className="h-6 w-3/4 mt-2" />
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) {
        return <div className="p-8 text-center">
             <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
             <p className="text-muted-foreground">El proyecto que buscas no existe o ha sido eliminado.</p>
             <Button asChild className="mt-4">
                <Link href="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Proyectos
                </Link>
             </Button>
        </div>
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
                                    <TableCell><Badge variant="outline">{getAssignedToName(obj)}</Badge></TableCell>
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
