'use client';

import { useState, useMemo, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Coffee, Globe, Home, UserX, Calendar as CalendarIcon, Filter } from "lucide-react";
import { AttendanceReportDialog } from "./_components/attendance-report-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const fixedDate = new Date(2024, 7, 26);
const yesterday = new Date(new Date().setDate(fixedDate.getDate() - 1));

const employees = [
  { id: 1, name: "Olivia Martin", department: "Ingeniería" },
  { id: 2, name: "Jackson Lee", department: "Diseño" },
  { id: 3, name: "Isabella Nguyen", department: "Marketing" },
  { id: 4, name: "William Kim", department: "Ingeniería" },
  { id: 5, name: "Sophia Davis", department: "Ventas" },
  { id: 6, name: "Liam Garcia", department: "RRHH" },
];

const allDepartments = ["Ingeniería", "Diseño", "Marketing", "Ventas", "RRHH"];

const attendanceLog = [
  { date: fixedDate, time: "09:01 AM", employee: "Olivia Martin", status: "Entrada Marcada", location: "Oficina", department: "Ingeniería" },
  { date: fixedDate, time: "09:03 AM", employee: "Jackson Lee", status: "Entrada Marcada", location: "Remoto", department: "Diseño" },
  { date: fixedDate, time: "11:30 AM", employee: "Isabella Nguyen", status: "En Descanso", location: "Oficina", department: "Marketing" },
  { date: fixedDate, time: "12:15 PM", employee: "Isabella Nguyen", status: "Entrada Marcada", location: "Oficina", department: "Marketing" },
  { date: fixedDate, time: "02:00 PM", employee: "William Kim", status: "Entrada Marcada", location: "Oficina", department: "Ingeniería" },
  { date: fixedDate, time: "05:05 PM", employee: "Olivia Martin", status: "Salida Marcada", location: "Oficina", department: "Ingeniería" },
  { date: yesterday, time: "09:00 AM", employee: "Sophia Davis", status: "Entrada Marcada", location: "Oficina", department: "Ventas" },
  { date: yesterday, time: "05:30 PM", employee: "Sophia Davis", status: "Salida Marcada", location: "Oficina", department: "Ventas" },
];

export default function AttendancePage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(fixedDate);
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

    const availableEmployees = useMemo(() => {
        if (selectedDepartment === 'all') {
            return employees;
        }
        return employees.filter(emp => emp.department === selectedDepartment);
    }, [selectedDepartment]);

    useEffect(() => {
        if (selectedEmployee !== 'all' && !availableEmployees.some(e => e.name === selectedEmployee)) {
            setSelectedEmployee('all');
        }
    }, [availableEmployees, selectedEmployee]);

    const filteredLog = useMemo(() => {
        return attendanceLog.filter(log => {
            const logDate = log.date;
            const dateMatch = selectedDate 
                ? logDate.getFullYear() === selectedDate.getFullYear() &&
                  logDate.getMonth() === selectedDate.getMonth() &&
                  logDate.getDate() === selectedDate.getDate()
                : true;
            
            const locationMatch = selectedLocation === 'all' || log.location === selectedLocation;
            const departmentMatch = selectedDepartment === 'all' || log.department === selectedDepartment;
            const employeeMatch = selectedEmployee === 'all' || log.employee === selectedEmployee;

            return dateMatch && locationMatch && departmentMatch && employeeMatch;
        });
    }, [selectedDate, selectedLocation, selectedDepartment, selectedEmployee]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Tiempo y Asistencia</h1>
        <p className="text-muted-foreground">Monitorea las entradas diarias, estados y cronogramas.</p>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Husin (Quién está dentro)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Oficina</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">28</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trabajo Remoto</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">14</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Descanso</CardTitle>
                <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">5</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">De Vacaciones</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ausente</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1</div>
            </CardContent>
            </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Timeline de Fichajes</CardTitle>
          <CardDescription>Un registro en tiempo real de los eventos de entrada del día seleccionado.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:items-center border-t border-border mt-4">
              <div className="flex flex-wrap gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                                "w-full sm:w-[240px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                          />
                      </PopoverContent>
                  </Popover>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Deptos.</SelectItem>
                    {allDepartments.map(dept => (
                         <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                 <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={selectedDepartment === 'all'}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Empleado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Empleados</SelectItem>
                        {availableEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Ubicaciones</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                  </SelectContent>
                </Select>

              </div>
              <div className="sm:ml-auto">
                 <AttendanceReportDialog attendanceLog={filteredLog} />
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Hora</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ubicación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLog.length > 0 ? filteredLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.employee}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        log.status === "Entrada Marcada" ? "border-green-500 text-green-700" :
                        log.status === "Salida Marcada" ? "border-red-500 text-red-700" :
                        "border-yellow-500 text-yellow-700"
                      }
                    >{log.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{log.location}</TableCell>
                </TableRow>
              )) : (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                          No se encontraron registros con los filtros aplicados.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
