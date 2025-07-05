'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Coffee, ArrowRight, ArrowLeft } from 'lucide-react';

// Mock data for clock-in events
const events = [
  { id: 1, date: new Date(2024, 7, 19), time: "09:01", type: "Entrada" },
  { id: 2, date: new Date(2024, 7, 19), time: "13:00", type: "Descanso" },
  { id: 3, date: new Date(2024, 7, 19), time: "14:02", type: "Entrada" },
  { id: 4, date: new Date(2024, 7, 19), time: "17:30", type: "Salida" },
  { id: 5, date: new Date(2024, 7, 20), time: "09:05", type: "Entrada" },
  { id: 6, date: new Date(2024, 7, 20), time: "17:35", type: "Salida" },
  { id: 7, date: new Date(2024, 7, 21), time: "08:58", type: "Entrada" },
  { id: 8, date: new Date(2024, 7, 21), time: "12:30", type: "Descanso" },
  { id: 9, date: new Date(2024, 7, 21), time: "13:30", type: "Entrada" },
  { id: 10, date: new Date(2024, 7, 21), time: "18:00", type: "Salida" },
  { id: 11, date: new Date(new Date().setDate(new Date().getDate() - 1)), time: "09:00", type: "Entrada" },
  { id: 12, date: new Date(new Date().setDate(new Date().getDate() - 1)), time: "17:00", type: "Salida" },
];

const getEventTypeBadge = (type: string) => {
    switch (type) {
        case "Entrada": return <Badge variant="outline" className="text-green-600 border-green-500"><ArrowRight className="h-3 w-3 mr-1"/>{type}</Badge>;
        case "Salida": return <Badge variant="outline" className="text-red-600 border-red-500"><ArrowLeft className="h-3 w-3 mr-1"/>{type}</Badge>;
        case "Descanso": return <Badge variant="outline" className="text-yellow-600 border-yellow-500"><Coffee className="h-3 w-3 mr-1"/>{type}</Badge>;
        default: return <Badge variant="secondary">{type}</Badge>;
    }
}

export default function EmployeeAttendancePage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(date);
        }
    };
    
    const changeDay = (amount: number) => {
        setCurrentDate(prev => addDays(prev, amount));
    }
    
    const changeWeek = (amount: number) => {
        setCurrentDate(prev => addDays(prev, amount * 7));
    }

    const weekStartsOn = 1; // Monday
    const week = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn }), i));
    const dailyEvents = events.filter(e => isSameDay(e.date, currentDate)).sort((a,b) => a.time.localeCompare(b.time));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Mi Calendario de Fichajes</h1>
                <p className="text-muted-foreground">Consulta tus registros de entrada y salida diarios, semanales y mensuales.</p>
            </div>

            <Tabs defaultValue="day">
                <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
                    <TabsTrigger value="day">Día</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="day" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="font-headline">
                                    {format(currentDate, "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => changeDay(-1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => changeDay(1)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Hora</TableHead>
                                        <TableHead>Tipo de Evento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyEvents.length > 0 ? (
                                        dailyEvents.map(event => (
                                            <TableRow key={event.id}>
                                                <TableCell className="font-medium">{event.time}</TableCell>
                                                <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                                                No hay registros para este día.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="week" className="mt-4">
                     <Card>
                        <CardHeader>
                             <div className="flex items-center justify-between">
                                <CardTitle className="font-headline">
                                    Semana del {format(week[0], "d 'de' MMMM", { locale: es })}
                                </CardTitle>
                                 <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => changeWeek(-1)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => changeWeek(1)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-7 border rounded-lg overflow-hidden">
                                {week.map(day => (
                                    <div key={day.toString()} className="border-b sm:border-r last:border-r-0">
                                        <div className="p-2 text-center bg-muted">
                                            <p className="font-semibold text-sm capitalize">{format(day, "eee", { locale: es })}</p>
                                            <p className="text-muted-foreground text-xs">{format(day, "d")}</p>
                                        </div>
                                        <div className="p-2 space-y-2 min-h-[100px]">
                                            {events.filter(e => isSameDay(e.date, day)).map(event => (
                                                <div key={event.id} className="flex items-center gap-2 text-xs">
                                                   <span className="font-mono">{event.time}</span>
                                                   {getEventTypeBadge(event.type)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="month" className="mt-4">
                     <Card>
                        <CardHeader>
                           <CardTitle className="font-headline">Vista Mensual</CardTitle>
                            <CardDescription>Selecciona un día para ver los detalles.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-8">
                             <Calendar
                                mode="single"
                                selected={currentDate}
                                onSelect={handleDateChange}
                                month={currentDate}
                                onMonthChange={setCurrentDate}
                                className="rounded-md border"
                                modifiers={{
                                    hasEvent: events.map(e => e.date)
                                }}
                                modifiersClassNames={{
                                    hasEvent: 'bg-primary/20 rounded-full'
                                }}
                             />
                             <div className="flex-1">
                                <h3 className="font-semibold mb-4 text-lg">
                                    Eventos del {format(currentDate, "d 'de' MMMM", { locale: es })}
                                </h3>
                                <div className="space-y-2">
                                     {dailyEvents.length > 0 ? (
                                        dailyEvents.map(event => (
                                            <div key={event.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                <span>{getEventTypeBadge(event.type)}</span>
                                                <span className="font-mono text-sm">{event.time}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No hay registros para este día.
                                        </p>
                                    )}
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
