'use client';

import { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Coffee, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


// Add geolocation to event type
type ClockInEvent = {
  id: number;
  date: Date;
  time: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
};

// Mock data for clock-in events with geolocation
const events: ClockInEvent[] = [
  { id: 1, date: new Date(2024, 7, 19), time: "09:01", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 2, date: new Date(2024, 7, 19), time: "13:00", type: "Descanso", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 3, date: new Date(2024, 7, 19), time: "14:02", type: "Entrada", location: "Cliente - Soltech", lat: 40.421, lng: -3.705 },
  { id: 4, date: new Date(2024, 7, 19), time: "17:30", type: "Salida", location: "Cliente - Soltech", lat: 40.421, lng: -3.705 },
  { id: 5, date: new Date(2024, 7, 20), time: "09:05", type: "Entrada", location: "Remoto - Casa", lat: 40.43, lng: -3.69 },
  { id: 6, date: new Date(2024, 7, 20), time: "17:35", type: "Salida", location: "Remoto - Casa", lat: 40.43, lng: -3.69 },
  { id: 7, date: new Date(2024, 7, 21), time: "08:58", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 8, date: new Date(2024, 7, 21), time: "12:30", type: "Descanso", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 9, date: new Date(2024, 7, 21), time: "13:30", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 10, date: new Date(2024, 7, 21), time: "18:00", type: "Salida", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 11, date: new Date(new Date().setDate(new Date().getDate() - 1)), time: "09:00", type: "Entrada", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
  { id: 12, date: new Date(new Date().setDate(new Date().getDate() - 1)), time: "17:00", type: "Salida", location: "Oficina Central", lat: 40.416775, lng: -3.703790 },
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyEvents.length > 0 ? (
                                            dailyEvents.map(event => (
                                                <Collapsible asChild key={event.id} open={openEventId === event.id} onOpenChange={() => setOpenEventId(prevId => prevId === event.id ? null : event.id)}>
                                                    <>
                                                        <CollapsibleTrigger asChild>
                                                            <TableRow className="cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted/50">
                                                                <TableCell className="font-medium">{event.time}</TableCell>
                                                                <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                                                                <TableCell>{event.location}</TableCell>
                                                            </TableRow>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent asChild>
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="p-0">
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
                                                        </CollapsibleContent>
                                                    </>
                                                </Collapsible>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
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
                                                <div className="flex items-center gap-2">
                                                    {getEventTypeBadge(event.type)}
                                                    <span className="text-sm">{event.location}</span>
                                                </div>
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
