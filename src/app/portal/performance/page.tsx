'use client'

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Goal, PlusCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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

type Task = {
  id: string;
  title: string;
  objective_id: string;
  completed: boolean;
  is_incentivized: boolean;
  incentive_id?: string;
};

type Incentive = {
  id: string;
  name: string;
  type: 'económico' | 'días_libres' | 'formación' | 'otro';
  value: string | number;
  period: 'mensual' | 'trimestral' | 'anual';
};

const OBJECTIVES_STORAGE_KEY = 'workflow-central-objectives';
const TASKS_STORAGE_KEY = 'workflow-central-tasks';
const INCENTIVES_STORAGE_KEY = 'workflow-central-incentives';

export default function EmployeePerformancePage() {
    const [myObjectives, setMyObjectives] = useState<Objective[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);

    useEffect(() => {
        try {
            const storedObjectives = localStorage.getItem(OBJECTIVES_STORAGE_KEY);
            if (storedObjectives) {
                const allObjectives: Objective[] = JSON.parse(storedObjectives);
                // Assuming Olivia Martin is the logged-in user
                setMyObjectives(allObjectives.filter(g => g.assigned_to === "Olivia Martin"));
            }

            const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }

            const storedIncentives = localStorage.getItem(INCENTIVES_STORAGE_KEY);
            if (storedIncentives) {
                setIncentives(JSON.parse(storedIncentives));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
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
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {objective.description}
                                    </p>
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
