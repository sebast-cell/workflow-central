'use client'

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
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils";

const reviewCycles = [
  { name: "Revisión Anual 2024", status: "Completado", period: "01 Ene - 31 Dic, 2024", participants: 48 },
  { name: "Check-in Q3 2024", status: "En Progreso", period: "01 Jul - 30 Sep, 2024", participants: 50 },
  { name: "Evaluación de Nuevas Incorporaciones", status: "Programado", period: "01 Oct - 31 Oct, 2024", participants: 4 },
];

export default function PerformancePage() {

    const getStatusVariant = (status: string) => {
      switch (status) {
        case "Completado": return "active";
        case "En Progreso": return "warning";
        case "Programado": return "secondary";
        default: return "default";
      }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión del Desempeño</h1>
                <p className="text-muted-foreground">Lanza evaluaciones, establece objetivos y fomenta el feedback continuo.</p>
            </div>

            <Tabs defaultValue="reviews">
                <TabsList>
                    <TabsTrigger value="reviews">Evaluaciones</TabsTrigger>
                    <TabsTrigger value="goals">Objetivos</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback Continuo</TabsTrigger>
                </TabsList>
                <TabsContent value="reviews">
                    <Card>
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
                     <Card>
                        <CardHeader>
                            <CardTitle>Seguimiento de Objetivos</CardTitle>
                            <CardDescription>Visualiza y gestiona los objetivos de la empresa y los equipos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground py-12">
                                <p>El seguimiento de objetivos de toda la empresa aparecerá aquí.</p>
                                <Button variant="secondary" className="mt-4">Establecer Objetivo de Empresa</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedback">
                     <Card>
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
        </div>
    )
}
