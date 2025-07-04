'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';


const balances = [
    { type: "Vacaciones", used: 8, total: 20 },
    { type: "Días Personales", used: 2, total: 5 },
    { type: "Licencia por Enfermedad", used: 3, total: 10 },
];

const requests = [
    { type: "Vacaciones", dates: "19 Ago - 23 Ago, 2024", status: "Aprobado" },
    { type: "Licencia por Enfermedad", dates: "12 Ago, 2024", status: "Aprobado" },
    { type: "Día Personal", dates: "02 Sep, 2024", status: "Pendiente" },
    { type: "Vacaciones", dates: "15 Jul - 17 Jul, 2024", status: "Rechazado" },
];

export default function EmployeeAbsencesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 4),
    });

    // Mock dates for the calendar display
    const approvedAbsences = [
        new Date(2024, 7, 12), // Aug 12
        new Date(2024, 7, 19), // Aug 19
        new Date(2024, 7, 20),
        new Date(2024, 7, 21),
        new Date(2024, 7, 22),
        new Date(2024, 7, 23),
    ];

    return (
    <div className="space-y-8">
       <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Mis Ausencias</h1>
                <p className="text-muted-foreground">Consulta tu historial, balance y solicita nuevo tiempo libre.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Solicitar Ausencia
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Nueva Solicitud de Ausencia</DialogTitle>
                        <DialogDescription>
                            Selecciona el tipo de ausencia y las fechas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="absence-type">Tipo de Ausencia</Label>
                            <Select>
                                <SelectTrigger id="absence-type">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vacation">Vacaciones</SelectItem>
                                    <SelectItem value="sick-leave">Licencia por Enfermedad</SelectItem>
                                    <SelectItem value="personal-day">Día Personal</SelectItem>
                                    <SelectItem value="other">Otro (especificar en motivo)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="date-range">Fechas</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date-range"
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Selecciona un rango de fechas</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Motivo (opcional)</Label>
                            <Textarea id="reason" placeholder="Escribe un breve motivo para tu solicitud..."/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={() => setIsDialogOpen(false)}>Enviar Solicitud</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balances.map(balance => (
            <Card key={balance.type}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-headline">{balance.type}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{balance.total - balance.used} <span className="text-sm font-normal text-muted-foreground">/ {balance.total} días restantes</span></p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Mis Solicitudes</CardTitle>
                    <CardDescription>Historial de tus solicitudes de ausencia.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {requests.map((request, index) => (
                            <TableRow key={index}>
                            <TableCell className="font-medium">{request.type}</TableCell>
                            <TableCell>{request.dates}</TableCell>
                            <TableCell className="text-right">
                                <Badge
                                className={
                                    request.status === "Aprobado" ? "bg-green-100 text-green-800" :
                                    request.status === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }
                                variant="secondary"
                                >{request.status}</Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Mi Calendario</CardTitle>
                    <CardDescription>Tus ausencias aprobadas de un vistazo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="multiple"
                        selected={approvedAbsences}
                        className="rounded-md border"
                        disabled={{ before: new Date(2024, 7, 1) }}
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
