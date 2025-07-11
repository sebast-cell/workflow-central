'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { type AttendanceLog, type Center, listSettings } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const containerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '0.5rem',
  overflow: 'hidden',
};

const defaultMapCenter = { lat: 40.416775, lng: -3.703790 };

export default function EmployeeAttendancePage() {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isClockingIn, setIsClockingIn] = useState(false);
    const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
                employeeName: 'Sebastián Núñez', // <-- Propiedad añadida
                department: 'Desarrollo',      // <-- Propiedad añadida
                timestamp: new Date().toISOString(),
                type: 'Entrada',
                location: `Lat: ${currentLocation.lat.toFixed(4)}, Lon: ${currentLocation.lng.toFixed(4)}`,
            };
            setAttendanceLog(prev => [newLog, ...prev]);
            toast({ title: "Fichaje de entrada registrado", description: `A las ${format(new Date(newLog.timestamp), 'HH:mm:ss')}` });
            setIsClockingIn(false);
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Asistencia</h1>
                <p className="text-muted-foreground">Registra tus entradas y salidas y consulta tu historial.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Registro de Fichaje</CardTitle>
                            <CardDescription>Tu ubicación actual se usará para registrar la entrada.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {locationError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error de Ubicación</AlertTitle>
                                    <AlertDescription>{locationError}</AlertDescription>
                                </Alert>
                            )}
                            <div style={containerStyle}>
                                {apiKey ? (
                                    <APIProvider apiKey={apiKey}>
                                        <Map
                                            center={currentLocation || defaultMapCenter}
                                            zoom={15}
                                            gestureHandling={'greedy'}
                                            disableDefaultUI={true}
                                            mapId="workflow-map-portal"
                                        >
                                            {currentLocation && <AdvancedMarker position={currentLocation} />}
                                        </Map>
                                    </APIProvider>
                                ) : <p>API Key for Maps is missing.</p>}
                            </div>
                            <Button className="w-full" size="lg" onClick={handleClockIn} disabled={!currentLocation || isClockingIn}>
                                {isClockingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                                {isClockingIn ? 'Registrando...' : 'Fichar Entrada/Salida'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Mis Centros de Trabajo</CardTitle>
                            <CardDescription>Ubicaciones asignadas para el fichaje.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <ul className="space-y-3">
                                    {centers.map(center => (
                                        <li key={center.id} className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 mt-1 text-primary" />
                                            <div>
                                                <p className="font-semibold">{center.name}</p>
                                                <p className="text-sm text-muted-foreground">{center.address}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="bg-gradient-accent-to-card">
                <CardHeader>
                    <CardTitle>Mi Historial de Fichajes</CardTitle>
                    <div className="flex items-center justify-between">
                        <CardDescription>
                            Semana del {format(week[0], 'd MMM')} al {format(week[6], 'd MMM, yyyy', { locale: es })}
                        </CardDescription>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 7))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Ubicación</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceLog.length > 0 ? attendanceLog.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>{format(new Date(log.timestamp), 'eeee, d MMM', { locale: es })}</TableCell>
                                    <TableCell>{format(new Date(log.timestamp), 'HH:mm:ss')}</TableCell>
                                    <TableCell className="capitalize">{log.type}</TableCell>
                                    <TableCell>{log.location}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No hay registros de asistencia para esta semana.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}