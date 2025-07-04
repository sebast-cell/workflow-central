'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Goal, PlusCircle } from "lucide-react";

const goals = [
  { name: "Completar certificación de React Avanzado", progress: 75, status: "En Progreso" },
  { name: "Liderar 2 sesiones de 'lunch & learn' sobre diseño de componentes", progress: 50, status: "En Progreso" },
  { name: "Mejorar el rendimiento de la carga de la página del panel en un 15%", progress: 100, status: "Completado" },
];

export default function EmployeePerformancePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Mi Desempeño</h1>
                <p className="text-muted-foreground">Consulta tus evaluaciones, sigue tus objetivos y gestiona tu crecimiento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Mis Objetivos</CardTitle>
                            <CardDescription>Tus metas personales y profesionales.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Añadir Objetivo</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {goals.map((goal, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium">{goal.name}</p>
                                    <Badge variant={goal.status === 'Completado' ? 'secondary' : 'outline'} className={goal.status === 'Completado' ? 'bg-green-100 text-green-800' : ''}>
                                        {goal.status}
                                    </Badge>
                                </div>
                                <Progress value={goal.progress} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Mis Evaluaciones de Desempeño</CardTitle>
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
