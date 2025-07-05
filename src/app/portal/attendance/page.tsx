'use client';

import { useState, useMemo, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Coffee, ArrowRight, ArrowLeft, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useDayRender, type DayProps } from 'react-day-picker';


// Add geolocation to event type
type ClockInEvent = {
  id: number;
  date: Date;
  time: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  project?: string;
  task?: string;
};

// Mock data for clock-in events with geolocation
const events: ClockInEvent[] = [
  { id: 1, date: new Date(2024, 7, 19), time: "09:01", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790, project: "Rediseño Web", task: "Componentes UI" },
  { id: 2, date: new Date(2024, 7, 19), time: "13:00", type: "Descanso", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 3, date: new Date(2024, 7, 19), time: "14:02", type: "Entrada", location: "Cliente - Soltech", lat: 40.421, lng: -3.705, project: "Rediseño Web", task: "Reunión de seguimiento" },
  { id: 4, date: new Date(2024, 7, 19), time: "17:30", type: "Salida", location: "Cliente - Soltech", lat: 40.421, lng: -3.705, project: "Rediseño Web", task: "Finalizar informe" },
  { id: 5, date: new Date(2024, 7, 20), time: "09:05", type: "Entrada", location: "Remoto - Casa", lat: 40.43, lng: -3.69, project: "App Móvil", task: "Bugfixing" },
  { id: 6, date: new Date(2024, 7, 20), time: "17:35", type: "Salida", location: "Remoto - Casa", lat: 40.43, lng: -3.69, project: "App Móvil", task: "Subir cambios" },
  { id: 7, date: new Date(2024, 7, 21), time: "08:58", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790, project: "Campaña Marketing", task: "Planificación" },
  { id: 8, date: new Date(2024, 7, 21), time: "12:30", type: "Descanso", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 9, date: new Date(2024, 7, 21), time: "13:30", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790, project: "Campaña Marketing", task: "Creación de contenido" },
  { id: 10, date: new Date(2024, 7, 21), time: "18:00", type: "Salida", location: "Oficina Central", lat: 40.416775, lng: -3.703790, project: "Campaña Marketing", task: "Revisión final" },
  { id: 11, date: new Date(new Date().setDate(new Date().getDate())), time: "09:00", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790, project: "Interno", task: "Reunión equipo" },
  { id: 12, date: new Date(new Date().setDate(new Date().getDate())), time: "17:00", type: "Salida", location: "Oficina Central", lat: 40.416775, lng: -3.703790, project: "Interno", task: "Organización" },
];

const getEventTypeBadge = (type: string) => {
    switch (type) {
        case "Entrada": return <Badge variant="outline" className="text-green-600 border-green-500"><ArrowRight className="h-3 w-3 mr-1"/>{type}</Badge>;
        case "Salida": return <Badge variant="outline" className="text-red-600 border-red-500"><ArrowLeft className="h-3 w-3 mr-1"/>{type}</Badge>;
        case "Descanso": return <Badge variant="outline" className="text-yellow-600 border-yellow-500"><Coffee className="h-3 w-3 mr-1"/>{type}</Badge>;
        default: return <Badge variant="secondary">{type}</Badge>;
    }
}

const getEventTypeIcon = (type: string) => {
    const iconMap = {
        "Entrada": { icon: <ArrowRight className="h-4 w-4 text-green-700" />, className: "bg-green-100" },
        "Salida": { icon: <ArrowLeft className="h-4 w-4 text-red-700" />, className: "bg-red-100" },
        "Descanso": { icon: <Coffee className="h-4 w-4 text-yellow-700" />, className: "bg-yellow-100" },
    };

    const eventStyle = iconMap[type as keyof typeof iconMap];

    if (!eventStyle) return <Badge variant="secondary">{type}</Badge>;

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", eventStyle.className)}>
                        {eventStyle.icon}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{type}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

const getTimelineIcon = (type: string) => {
    switch (type) {
        case "Entrada": return <ArrowRight className="h-5 w-5 text-green-600" />;
        case "Salida": return <ArrowLeft className="h-5 w-5 text-red-600" />;
        case "Descanso": return <Coffee className="h-5 w-5 text-yellow-600" />;
        default: return <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />;
    }
}


export default function EmployeeAttendancePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openEventId, setOpenEventId] = useState<number | null>(null);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(date);
            setOpenEventId(null);
        }
    };
    
    const changeDay = (amount: number) => {
        setCurrentDate(prev => addDays(prev, amount));
        setOpenEventId(null);
    }
    
    const changeWeek = (amount: number) => {
        setCurrentDate(prev => addDays(prev, amount * 7));
        setOpenEventId(null);
    }

    const weekStartsOn = 1; // Monday
    const week = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek(currentDate, { weekStartsOn }), i));
    
    const dailyEvents = useMemo(() => 
        events.filter(e => isSameDay(e.date, currentDate)).sort((a,b) => a.time.localeCompare(b.time)),
        [currentDate]
    );

    const DayWithDot = (props: DayProps) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);
        
        const hasEvent = useMemo(() => 
            events.some(e => isSameDay(e.date, props.date)),
        [props.date]);

        if (dayRender.isHidden) {
            return <></>;
        }
        if (!dayRender.isButton) {
            return <div {...dayRender.divProps} />;
        }
        
        return (
             <div className="relative">
                <button
                    ref={buttonRef}
                    {...dayRender.buttonProps}
                />
                {hasEvent && !dayRender.selected && !dayRender.today &&(
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
             </div>
        )
    }

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
                    <div className="grid grid-cols-1 gap-8">
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
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Ubicación</TableHead>
                                            <TableHead>Proyecto</TableHead>
                                            <TableHead>Tarea</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyEvents.length > 0 ? (
                                            dailyEvents.map(event => (
                                                <React.Fragment key={event.id}>
                                                    <TableRow
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => setOpenEventId(prevId => prevId === event.id ? null : event.id)}
                                                    >
                                                        <TableCell className="font-medium">{event.time}</TableCell>
                                                        <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                                                        <TableCell>
                                                            <div>{event.location}</div>
                                                            <div className="text-xs text-muted-foreground">Lat: {event.lat.toFixed(4)}, Lon: {event.lng.toFixed(4)}</div>
                                                        </TableCell>
                                                        <TableCell>{event.project || '-'}</TableCell>
                                                        <TableCell>{event.task || '-'}</TableCell>
                                                    </TableRow>
                                                    {openEventId === event.id && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="p-0">
                                                                <div className="p-4 bg-background">
                                                                    <h4 className="font-semibold mb-2">Ubicación del Fichaje</h4>
                                                                    <div className="h-[300px] w-full rounded-md overflow-hidden border">
                                                                        {apiKey ? (
                                                                            <APIProvider apiKey={apiKey}>
                                                                                <Map
                                                                                    center={{ lat: event.lat, lng: event.lng }}
                                                                                    zoom={15}
                                                                                    gestureHandling={'greedy'}
                                                                                    disableDefaultUI={true}
                                                                                    mapId={`map-${event.id}`}
                                                                                >
                                                                                    <AdvancedMarker position={{ lat: event.lat, lng: event.lng }} title={event.location}>
                                                                                        <MapPin className={`h-6 w-6 text-primary`}/>
                                                                                    </AdvancedMarker>
                                                                                </Map>
                                                                            </APIProvider>
                                                                        ) : (
                                                                            <div className="flex items-center justify-center h-full bg-muted">
                                                                                <p className="text-sm text-muted-foreground">Clave de API de Google Maps no configurada.</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                                    No hay registros para este día.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
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
                            <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-border rounded-lg border">
                                {week.map(day => (
                                    <div key={day.toString()}>
                                        <div className="p-3 text-center bg-muted/50">
                                            <p className="text-sm font-medium capitalize text-muted-foreground">{format(day, "eee", { locale: es })}</p>
                                            <p className="mt-1 text-xl font-semibold">{format(day, "d")}</p>
                                        </div>
                                        <div className="p-3 space-y-3 min-h-[140px]">
                                            {events.filter(e => isSameDay(e.date, day)).sort((a,b) => a.time.localeCompare(b.time)).map(event => (
                                                <div key={event.id} className="flex items-center gap-2">
                                                   {getEventTypeIcon(event.type)}
                                                   <span className="font-semibold text-foreground tabular-nums">{event.time}</span>
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
                           <CardTitle className="font-headline">Resumen Mensual</CardTitle>
                            <CardDescription>Tu actividad de fichajes durante el mes. Selecciona un día para ver los detalles.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="flex justify-center items-start">
                                <Calendar
                                    mode="single"
                                    selected={currentDate}
                                    onSelect={handleDateChange}
                                    month={currentDate}
                                    onMonthChange={setCurrentDate}
                                    className="rounded-md border p-3"
                                    components={{ Day: DayWithDot }}
                                />
                             </div>
                             <div className="flex-1">
                                <h3 className="font-semibold mb-4 text-lg">
                                    Registros del {format(currentDate, "d 'de' MMMM", { locale: es })}
                                </h3>
                                {dailyEvents.length > 0 ? (
                                    <ul className="space-y-4">
                                        {dailyEvents.map(event => (
                                            <li key={event.id} className="flex gap-4 items-start">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                                    {getTimelineIcon(event.type)}
                                                </div>
                                                <div className="flex-1 pt-1.5">
                                                    <div className="flex items-baseline justify-between">
                                                        <p className="font-semibold text-foreground">{event.time}</p>
                                                        <p className="text-sm text-muted-foreground">{event.location}</p>
                                                    </div>
                                                    {event.project && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {event.project}{event.task ? ` • ${event.task}` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg border-2 border-dashed bg-muted/50">
                                        <CalendarIcon className="h-10 w-10 mb-4 text-muted-foreground/50" />
                                        <p className="font-semibold">Sin registros</p>
                                        <p className="text-sm">No hay fichajes para el día seleccionado.</p>
                                    </div>
                                )}
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
