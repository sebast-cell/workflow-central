'use client'

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Employee, AbsenceRequest, AbsenceType } from "@/lib/api";
import { listAbsenceRequests, listEmployees, listSettings, updateAbsenceRequestStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AbsencesPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [requestsData, employeesData, absenceTypesData] = await Promise.all([
            listAbsenceRequests(),
            listEmployees(),
            listSettings<AbsenceType>('absenceTypes'),
        ]);
        setRequests(requestsData);
        setEmployees(employeesData);
        setAbsenceTypes(absenceTypesData);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al cargar datos",
            description: "No se pudieron obtener los datos de ausencias.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (requestId: string, status: AbsenceRequest['status']) => {
    try {
        await updateAbsenceRequestStatus(requestId, status);
        toast({
            title: "Estado actualizado",
            description: `La solicitud ha sido marcada como ${status.toLowerCase()}.`
        });
        fetchData(); // Refresh data
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error al actualizar",
            description: "No se pudo cambiar el estado de la solicitud.",
        });
    }
  };


  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aprobado": return "active";
      case "Pendiente": return "warning";
      case "Rechazado": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ausencias y Tiempo Libre</h1>
        <p className="text-muted-foreground">Gestiona vacaciones, licencias por enfermedad y otras ausencias de los empleados.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-accent-to-card">
            <CardHeader>
              <CardTitle>Calendario de Ausencias del Equipo</CardTitle>
              <CardDescription>Vista mensual de todas las ausencias del equipo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-lg border w-full"
                numberOfMonths={1}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card className="bg-gradient-accent-to-card">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="vacations" defaultChecked/>
                <label htmlFor="vacations" className="text-sm font-medium leading-none">Vacaciones</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="absences" defaultChecked/>
                <label htmlFor="absences" className="text-sm font-medium leading-none">Ausencias</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="holidays" />
                <label htmlFor="holidays" className="text-sm font-medium leading-none">Festivos</label>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-accent-to-card">
            <CardHeader>
                <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Asignar Ausencia
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Asignar Nueva Ausencia</DialogTitle>
                            <DialogDescription>
                                Asigna directamente una ausencia a un empleado.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                             <div className="space-y-2">
                                <Label htmlFor="employee">Empleado</Label>
                                <Select>
                                    <SelectTrigger id="employee">
                                        <SelectValue placeholder="Seleccionar empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(emp => (
                                          <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="absence-type">Tipo de Ausencia</Label>
                                <Select>
                                    <SelectTrigger id="absence-type">
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {absenceTypes.map(type => (
                                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                        ))}
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
                                        numberOfMonths={1}
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button>Asignar Ausencia</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Datos
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
       <Card className="bg-gradient-accent-to-card">
        <CardHeader>
          <CardTitle>Solicitudes Pendientes y Recientes</CardTitle>
          <CardDescription>Revisa y gestiona las solicitudes de ausencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="animate-spin"/></TableCell></TableRow>
              ) : requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.employeeName}</TableCell>
                      <TableCell>{request.absenceTypeName}</TableCell>
                      <TableCell>{format(parseISO(request.startDate), 'd MMM', { locale: es })} - {format(parseISO(request.endDate), 'd MMM, yyyy', { locale: es })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'Pendiente' ? (
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" className="text-accent" onClick={() => handleStatusChange(request.id, 'Aprobado')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprobar
                            </Button>
                             <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleStatusChange(request.id, 'Rechazado')}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Rechazar
                            </Button>
                          </div>
                        ) : (
                           <span className="text-muted-foreground text-sm">Gestionado</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No hay solicitudes.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
