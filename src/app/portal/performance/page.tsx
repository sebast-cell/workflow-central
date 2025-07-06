'use client'

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Gift, Goal, PlusCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Goal = {
  id: number;
  name: string;
  description: string;
  assignee: string;
  type: 'Individual' | 'Equipo' | 'Empresa';
  metricType: 'Porcentaje' | 'Numérico';
  targetValue: number;
  currentValue: number;
  status: 'Pendiente' | 'En Progreso' | 'Completado';
  incentiveId?: string;
};

type Incentive = {
  id: string;
  name: string;
  type: 'Económico' | 'Días libres' | 'Formación' | 'Personalizado';
  details: string; 
};

const GOALS_STORAGE_KEY = 'workflow-central-goals';
const INCENTIVES_STORAGE_KEY = 'workflow-central-incentives';

export default function EmployeePerformancePage() {
    const [myGoals, setMyGoals] = useState<Goal[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);

    useEffect(() => {
        try {
            const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
            if (storedGoals) {
                const allGoals: Goal[] = JSON.parse(storedGoals);
                // Assuming Olivia Martin is the logged-in user
                setMyGoals(allGoals.filter(g => g.assignee === "Olivia Martin"));
            }

            const storedIncentives = localStorage.getItem(INCENTIVES_STORAGE_KEY);
            if (storedIncentives) {
                setIncentives(JSON.parse(storedIncentives));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Completado': return 'active';
            case 'En Progreso': return 'warning';
            default: return 'secondary';
        }
    };
    
    const calculateProgress = (current: number, target: number) => {
        if (target === 0) return 0;
        return (current / target) * 100;
    }

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
                        {myGoals.map((goal, index) => {
                            const progress = calculateProgress(goal.currentValue, goal.targetValue);
                            const incentive = incentives.find(i => i.id === goal.incentiveId);
                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 font-medium">
                                          <span>{goal.name}</span>
                                          {incentive && (
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
                                        <Badge variant={getStatusVariant(goal.status)}>
                                            {goal.status}
                                        </Badge>
                                    </div>
                                    <Progress value={progress} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {goal.metricType === 'Numérico' 
                                            ? `${goal.currentValue} / ${goal.targetValue}` 
                                            : `${Math.round(progress)}%`}
                                    </p>
                                </div>
                            )
                        })}
                        </TooltipProvider>
                        {myGoals.length === 0 && (
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
