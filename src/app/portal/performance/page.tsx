'use client'

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Goal, PlusCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { type Objective, type Task, type Incentive, listObjectives, listTasks, listIncentives, calculateIncentiveForObjective } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type ObjectiveWithIncentive = Objective & {
    incentiveResult?: { result: string | number; message: string; };
    isLoadingIncentive: boolean;
};

export default function EmployeePerformancePage() {
    const { toast } = useToast();
    const [myObjectives, setMyObjectives] = useState<ObjectiveWithIncentive[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // This page shows a generic demonstration. In a real app, you would get the
    // current user ID from an authentication context to show personalized data.
    const isDemoMode = true; 

    const fetchIncentiveDataForObjective = async (objective: Objective) => {
        if (!objective.is_incentivized) return;

        setMyObjectives(prev => prev.map(o => o.id === objective.id ? { ...o, isLoadingIncentive: true } : o));
        try {
            const result = await calculateIncentiveForObjective(objective.id);
             setMyObjectives(prev => prev.map(o => o.id === objective.id ? { ...o, incentiveResult: result, isLoadingIncentive: false } : o));
        } catch (error) {
            console.error(`Failed to fetch incentive for objective ${objective.id}:`, error);
            setMyObjectives(prev => prev.map(o => o.id === objective.id ? { ...o, isLoadingIncentive: false } : o));
             toast({ variant: "destructive", title: "Error", description: `No se pudo calcular el incentivo para "${objective.title}".` });
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [allObjectives, allTasks, allIncentives] = await Promise.all([
                listObjectives(),
                listTasks(),
                listIncentives()
            ]);
            
            // For this demo, we'll just show the first few objectives as an example.
            const demoObjectives = allObjectives.slice(0, 3);
            
            setMyObjectives(demoObjectives.map(o => ({...o, isLoadingIncentive: false })));
            setTasks(allTasks);
            setIncentives(allIncentives);
            setIsLoading(false);

            // Fetch incentive data for each objective after initial data load
            demoObjectives.forEach(obj => {
                if(obj.is_incentivized) {
                    fetchIncentiveDataForObjective(obj);
                }
            });

        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de desempeño." });
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const getObjectiveProgress = (objectiveId: string) => {
        const relevantTasks = tasks.filter(t => t.objective_id === objectiveId);
        if (relevantTasks.length === 0) return { progress: 0, completed: 0, total: 0 };

        const completedTasks = relevantTasks.filter(t => t.completed);
        const progress = (completedTasks.length / relevantTasks.length) * 100;
        return { progress, completed: completedTasks.length, total: relevantTasks.length };
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Desempeño</h1>
                <p className="text-muted-foreground">Consulta tus evaluaciones, sigue tus objetivos y gestiona tu crecimiento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card className="bg-gradient-accent-to-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Mis Objetivos</CardTitle>
                            <CardDescription>Tus metas personales y profesionales asignadas.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Sugerir Objetivo</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : myObjectives.length > 0 ? (
                            <TooltipProvider>
                            {myObjectives.map((objective) => {
                                const incentive = incentives.find(i => i.id === objective.incentive_id);
                                const { progress, completed, total } = getObjectiveProgress(objective.id);
                                return (
                                    <div key={objective.id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 font-medium">
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
                                             <span className="text-sm text-muted-foreground">{completed}/{total}</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        <div className="flex justify-between items-start mt-1">
                                            <p className="text-sm text-muted-foreground w-3/4">
                                                {objective.description}
                                            </p>
                                            {objective.is_incentivized && (
                                                <div className="text-sm text-right font-medium text-primary">
                                                    {objective.isLoadingIncentive ? <Loader2 className="h-4 w-4 animate-spin ml-auto" /> :
                                                      objective.incentiveResult && objective.incentiveResult.result && (String(objective.incentiveResult.result) !== "0") ? (
                                                          <>
                                                            <p>Incentivo: {typeof objective.incentiveResult.result === 'number' ? `€${objective.incentiveResult.result.toFixed(2)}` : objective.incentiveResult.result}</p>
                                                            <p className="text-xs text-muted-foreground">{objective.incentiveResult.message}</p>
                                                          </>
                                                      ) : objective.incentiveResult ? (
                                                         <p className="text-xs text-muted-foreground">{objective.incentiveResult.message}</p>
                                                      ) : null
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            </TooltipProvider>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <Goal className="mx-auto h-8 w-8 mb-2" />
                                <p>No tienes objetivos asignados actualmente.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card className="bg-gradient-accent-to-card">
                    <CardHeader>
                        <CardTitle>Mis Evaluaciones de Desempeño</CardTitle>
                        <CardDescription>Historial de tus ciclos de evaluación.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Revisión Anual 2023</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                   <p className="text-sm text-muted-foreground">Completada el 15 de Enero, 2024. Manager: Noah Brown.</p>
                                   <Button variant="secondary">Ver Informe de Evaluación</Button>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>Check-in Q2 2024</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                   <p className="text-sm text-muted-foreground">Completada el 10 de Julio, 2024. Manager: Noah Brown.</p>
                                   <Button variant="secondary">Ver Informe de Evaluación</Button>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Check-in Q3 2024</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                   <p className="text-sm text-muted-foreground">Tu autoevaluación está pendiente. Fecha límite: 25 de Sep, 2024.</p>
                                   <Button>Completar Autoevaluación</Button>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
