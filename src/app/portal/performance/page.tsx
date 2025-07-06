'use client'

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Goal, PlusCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { type Objective, type Task, type Incentive, listObjectives, listTasks, listIncentives } from "@/lib/api";

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


export default function EmployeePerformancePage() {
    const [myObjectives, setMyObjectives] = useState<Objective[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);

    // Simulating logged in user
    const currentUserId = "a1b2c3d4-e5f6-7890-1234-567890abcdef"; // Olivia Martin's UUID

    const fetchData = async () => {
        try {
            const [allObjectives, allTasks, allIncentives] = await Promise.all([
                listObjectives(),
                listTasks(),
                listIncentives()
            ]);
            
            // This filtering should ideally happen on the backend
            setMyObjectives(allObjectives.filter(o => o.assigned_to === currentUserId));
            setTasks(allTasks);
            setIncentives(allIncentives);
        } catch (error) {
            console.error("Failed to fetch data:", error);
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
                        <TooltipProvider>
                        {myObjectives.map((objective, index) => {
                            const incentive = incentives.find(i => i.id === objective.incentive_id);
                            const { progress, completed, total } = getObjectiveProgress(objective.id);
                            const calculatedIncentive = calculateIncentive(objective, tasks, incentives);
                            return (
                                <div key={index}>
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
                                        {objective.is_incentivized && calculatedIncentive !== 'N/A' && (
                                            <p className="text-sm text-right font-medium text-primary">
                                            Incentivo: {calculatedIncentive}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        </TooltipProvider>
                        {myObjectives.length === 0 && (
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
