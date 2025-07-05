'use client'

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns";

const requests = [
  { employee: "Liam Johnson", type: "Vacaciones", dates: "19 Ago - 23 Ago, 2024", status: "Aprobado" },
  { employee: "Emma Wilson", type: "Licencia Médica", dates: "12 Ago, 2024", status: "Aprobado" },
  { employee: "Noah Brown", type: "Vacaciones", dates: "02 Sep - 06 Sep, 2024", status: "Pendiente" },
  { employee: "Ava Smith", type: "Día Personal", dates: "15 Ago, 2024", status: "Rechazado" },
];

export default function AbsencesPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Ausencias y Tiempo Libre</h1>
        <p className="text-muted-foreground">Gestiona vacaciones, licencias por enfermedad y otras ausencias de los empleados.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Calendario de Ausencias del Equipo</CardTitle>
              <CardDescription>Vista mensual de todas las ausencias del equipo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border w-full"
                numberOfMonths={1}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Filtros</CardTitle>
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
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Acciones</CardTitle>
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
                            <DialogTitle className="font-headline">Asignar Nueva Ausencia</DialogTitle>
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
                                        <SelectItem value="liam">Liam Johnson</SelectItem>
                                        <SelectItem value="emma">Emma Wilson</SelectItem>
                                        <SelectItem value="noah">Noah Brown</SelectItem>
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
                                        <SelectItem value="vacation">Vacaciones</SelectItem>
                                        <SelectItem value="sick-leave">Licencia por Enfermedad</SelectItem>
                                        <SelectItem value="personal-day">Día Personal</SelectItem>
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
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Solicitudes Pendientes y Recientes</CardTitle>
          <CardDescription>Revisa y gestiona las solicitudes de ausencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{request.employee}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.dates}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={cn(
                        request.status === "Aprobado" && "bg-accent text-accent-foreground",
                        request.status === "Pendiente" && "bg-warning text-warning-foreground",
                        request.status === "Rechazado" && "bg-destructive text-destructive-foreground",
                        "border-transparent"
                      )}
                    >{request.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
