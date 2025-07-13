'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfWeek, addDays, isSameDay, isToday, subDays, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Coffee, ArrowRight, ArrowLeft, MapPin, Calendar as CalendarIcon, AlertCircle, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useDayRender, type DayProps } from 'react-day-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { type AttendanceLog, type Center, listSettings } from '@/lib/api';

const containerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '0.5rem',
  overflow: 'hidden',
};

const defaultMapCenter = { lat: 40.416775, lng: -3.703790 };

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
                <TooltipContent><p>{type}</p></TooltipContent>
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
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openEventId, setOpenEventId] = useState<string | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";

    const week = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const centersData = await listSettings('centers') as Center[];
                setCenters(centersData);
                // Aquí iría la llamada para obtener el log de asistencia del empleado
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ variant: 'destructive', title: "Error", description: "No se pudieron cargar los datos iniciales." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError(null);
            },
            (error) => {
                setLocationError(error.message);
            },
            { enableHighAccuracy: true }
        );
    }, [toast]);

    const dailyEvents = useMemo(() => 
      attendanceLog
        .filter(e => isSameDay(new Date(e.timestamp), currentDate))
        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [currentDate, attendanceLog]);

    const handleClockIn = () => {
        if (!currentLocation) {
            toast({ variant: "destructive", title: "Ubicación no disponible", description: "No podemos registrar tu fichaje sin tu ubicación." });
            return;
        }
        setIsClockingIn(true);
        setTimeout(() => {
            const newLog: AttendanceLog = {
                id: uuidv4(),
                employeeId: 'user-1',
                employeeName: 'Sebastián Núñez', // Propiedad añadida
                department: 'Desarrollo',      // Propiedad añadida
                timestamp: new Date().toISOString(),
                type: 'Entrada',
                location: `Lat: ${currentLocation.lat.toFixed(4)}, Lon: ${currentLocation.lng.toFixed(4)}`,
            };
            setAttendanceLog(prev => [newLog, ...prev]);
            toast({ title: "Fichaje de entrada registrado", description: `A las ${format(new Date(newLog.timestamp), 'HH:mm:ss')}` });
            setIsClockingIn(false);
        }, 1500);
    };
    
    const DayWithDot = (props: DayProps) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);
        
        const hasEvent = useMemo(() => 
            attendanceLog.some(e => isSameDay(new Date(e.timestamp), props.date)),
        [props.date]);

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
                    <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Asistencia</h1>
                <p className="text-muted-foreground">Registra tus entradas y salidas y consulta tu historial.</p>
            </div>
            {/* The rest of the JSX for EmployeeAttendancePage goes here... */}
        </div>
    );
}