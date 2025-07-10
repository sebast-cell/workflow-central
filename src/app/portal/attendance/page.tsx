'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Coffee, ArrowRight, ArrowLeft, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useDayRender, type DayProps } from 'react-day-picker';
import { type AttendanceLog as ApiAttendanceLog, listAttendanceLogs, createAttendanceLog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';


const getEventTypeBadge = (type: string) => {
    switch (type) {
        case "Entrada": return <Badge variant="outline" className="text-accent border-accent"><ArrowRight className="h-3 w-3 mr-1"/>{type}</Badge>;
        case "Salida": return <Badge variant="outline" className="text-destructive border-destructive"><ArrowLeft className="h-3 w-3 mr-1"/>{type}</Badge>;
        case "Descanso": return <Badge variant="outline" className="text-warning border-warning"><Coffee className="h-3 w-3 mr-1"/>{type}</Badge>;
        default: return <Badge variant="secondary">{type}</Badge>;
    }
}

const getEventTypeIcon = (type: string) => {
    const iconMap = {
        "Entrada": { icon: <ArrowRight className="h-4 w-4 text-accent" />, className: "bg-accent/10" },
        "Salida": { icon: <ArrowLeft className="h-4 w-4 text-destructive" />, className: "bg-destructive/10" },
        "Descanso": { icon: <Coffee className="h-4 w-4 text-warning" />, className: "bg-warning/10" },
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
        case "Entrada": return <ArrowRight className="h-5 w-5 text-accent" />;
        case "Salida": return <ArrowLeft className="h-5 w-5 text-destructive" />;
        case "Descanso": return <Coffee className="h-5 w-5 text-warning" />;
        default: return <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />;
    }
}


export default function EmployeeAttendancePage() {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openEventId, setOpenEventId] = useState<string | null>(null);
    const [events, setEvents] = useState<ApiAttendanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";
    
    // In a real app, this would come from an auth context
    const FAKE_EMPLOYEE = {
        id: "1",
        name: "Olivia Martin",
        department: "Ingeniería"
    };

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const logs = await listAttendanceLogs();
            // Filter for the current user for this portal view
            setEvents(logs.filter(log => log.employeeId === FAKE_EMPLOYEE.id));
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los registros de fichaje." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleClockIn = (type: 'Entrada' | 'Salida' | 'Descanso') => {
        if (!navigator.geolocation) {
          toast({ variant: "destructive", title: "Error", description: "Tu navegador no soporta la geolocalización." });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const newLog: Omit<ApiAttendanceLog, 'id'> = {
                employeeId: FAKE_EMPLOYEE.id,
                employeeName: FAKE_EMPLOYEE.name,
                department: FAKE_EMPLOYEE.department,
                timestamp: new Date().toISOString(),
                type: type,
                location: 'Fichaje Móvil', // Or use a reverse geocoding API
                lat: latitude,
                lng: longitude,
            };

            try {
                await createAttendanceLog(newLog);
                toast({ title: "Fichaje Exitoso", description: `Se ha registrado tu ${type.toLowerCase()}.` });
                fetchEvents(); // Refresh data
            } catch (error) {
                 toast({ variant: "destructive", title: "Error al Fichar", description: "No se pudo guardar el registro." });
            }
          },
          () => {
             toast({ variant: "destructive", title: "Error de Ubicación", description: "No se pudo obtener tu ubicación." });
          }
        );
    };


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
        events.filter(e => isSameDay(parseISO(e.timestamp), currentDate)).sort((a,b) => a.timestamp.localeCompare(b.timestamp)),
        [currentDate, events]
    );

    const DayWithDot = (props: DayProps) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);
        
        const hasEvent = useMemo(() => 
            events.some(e => isSameDay(parseISO(e.timestamp), props.date)),
        [props.date, events]);

        if (dayRender.isHidden) {
            return <></>;
        }
        if (!dayRender.isButton) {
            return <div {...dayRender.divProps} />;
        }
        
        return (
            <div className="relative flex h-full items-center justify-center">
                <button
                    ref={buttonRef}
                    {...dayRender.buttonProps}
                />
                {hasEvent && !isToday(props.date) && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Calendario de Fichajes</h1>
                    <p className="text-muted-foreground">Consulta tus registros de entrada y salida diarios, semanales y mensuales.</p>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={() => handleClockIn('Entrada')} variant="active">Marcar Entrada</Button>
                    <Button onClick={() => handleClockIn('Salida')} variant="destructive">Marcar Salida</Button>
                    <Button onClick={() => handleClockIn('Descanso')} variant="warning">Descanso</Button>
                </div>
            </div>

            <Tabs defaultValue="day">
                <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
                    <TabsTrigger value="day">Día</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="day" className="mt-4">
                    <div className="grid grid-cols-1 gap-8">
                        <Card className="bg-gradient-accent-to-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
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
                                                        <TableCell className="font-medium">{format(parseISO(event.timestamp), 'HH:mm')}</TableCell>
                                                        <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                                                        <TableCell>
                                                            <div>{event.location}</div>
                                                            {event.lat && <div className="text-xs text-muted-foreground">Lat: {event.lat.toFixed(4)}, Lon: {event.lng?.toFixed(4)}</div>}
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
                                                                        {apiKey && event.lat && event.lng ? (
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
                                                                                <p className="text-sm text-muted-foreground">Datos de mapa no disponibles.</p>
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
                     <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                             <div className="flex items-center justify-between">
                                <CardTitle>
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
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-border">
                                {week.map(day => (
                                    <div key={day.toString()}>
                                        <div className="p-3 text-center bg-muted/50">
                                            <p className="text-sm font-medium capitalize text-muted-foreground">{format(day, "eee", { locale: es })}</p>
                                            <p className="mt-1 text-xl font-semibold">{format(day, "d")}</p>
                                        </div>
                                        <div className="p-3 space-y-3 min-h-[140px]">
                                            {events.filter(e => isSameDay(parseISO(e.timestamp), day)).sort((a,b) => a.timestamp.localeCompare(b.timestamp)).map(event => (
                                                <div key={event.id} className="flex items-center gap-2">
                                                   {getEventTypeIcon(event.type)}
                                                   <span className="font-semibold text-foreground tabular-nums">{format(parseISO(event.timestamp), 'HH:mm')}</span>
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
                     <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                           <CardTitle>Resumen Mensual</CardTitle>
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
                                    className="rounded-lg border p-3"
                                    components={{ Day: DayWithDot }}
                                    disabled={isLoading}
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
                                                        <p className="font-semibold text-foreground">{format(parseISO(event.timestamp), 'HH:mm')}</p>
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
