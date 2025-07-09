

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Coffee, Globe, Home, UserX, Calendar as CalendarIcon, Filter } from "lucide-react";
import { AttendanceReportDialog } from "./_components/attendance-report-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isWithinInterval, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Employee = {
    id: number;
    name: string;
    department: string;
};

type AttendanceLog = {
    date: Date;
    time: string;
    employee: string;
    status: string;
    location: string;
    department: string;
};

const employees: Employee[] = [
  { id: 1, name: "Olivia Martin", department: "Ingeniería" },
  { id: 2, name: "Jackson Lee", department: "Diseño" },
  { id: 3, name: "Isabella Nguyen", department: "Marketing" },
  { id: 4, name: "William Kim", department: "Ingeniería" },
  { id: 5, name: "Sophia Davis", department: "Ventas" },
  { id: 6, name: "Liam Garcia", department: "RRHH" },
  { id: 7, name: "Lucas Brown", department: "Ingeniería" },
  { id: 8, name: "Mia Miller", department: "Diseño" },
  { id: 9, name: "Benjamin Wilson", department: "Marketing" },
  { id: 10, name: "Charlotte Moore", department: "Ventas" },
  { id: 11, name: "Henry Taylor", department: "RRHH" },
  { id: 12, name: "Amelia Anderson", department: "Ingeniería" },
];

const allDepartments = ["Ingeniería", "Diseño", "Marketing", "Ventas", "RRHH"];

const attendanceLog: AttendanceLog[] = [
  { date: new Date(2024, 7, 26), time: "09:01 AM", employee: "Olivia Martin", status: "Entrada Marcada", location: "Oficina", department: "Ingeniería" },
  { date: new Date(2024, 7, 26), time: "09:03 AM", employee: "Jackson Lee", status: "Entrada Marcada", location: "Remoto", department: "Diseño" },
  { date: new Date(2024, 7, 26), time: "11:30 AM", employee: "Isabella Nguyen", status: "En Descanso", location: "Oficina", department: "Marketing" },
  { date: new Date(2024, 7, 26), time: "12:15 PM", employee: "Isabella Nguyen", status: "Entrada Marcada", location: "Oficina", department: "Marketing" },
  { date: new Date(2024, 7, 26), time: "05:05 PM", employee: "Olivia Martin", status: "Salida Marcada", location: "Oficina", department: "Ingeniería" },
  { date: new Date(2024, 7, 25), time: "09:00 AM", employee: "Sophia Davis", status: "Entrada Marcada", location: "Oficina", department: "Ventas" },
  { date: new Date(2024, 7, 25), time: "02:00 PM", employee: "William Kim", status: "Entrada Marcada", location: "Oficina", department: "Ingeniería" },
  { date: new Date(2024, 7, 25), time: "05:30 PM", employee: "Sophia Davis", status: "Salida Marcada", location: "Oficina", department: "Ventas" },
  { date: new Date(2024, 7, 24), time: "08:55 AM", employee: "Liam Garcia", status: "Entrada Marcada", location: "Remoto", department: "RRHH" },
  { date: new Date(2024, 7, 24), time: "04:50 PM", employee: "Liam Garcia", status: "Salida Marcada", location: "Remoto", department: "RRHH" },
];

const absencesData = [
  { employee: "William Kim", type: "De Vacaciones", from: new Date(2024, 7, 26), to: new Date(2024, 7, 30) },
  { employee: "Liam Garcia", type: "De Vacaciones", from: new Date(2024, 7, 23), to: new Date(2024, 7, 24) },
];

function parseAMPM(timeStr: string) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier.toUpperCase() === 'PM') {
        hours = String(parseInt(hours, 10) + 12);
    }
    return new Date(1970, 0, 1, Number(hours), Number(minutes));
}

export default function AttendancePage() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: new Date(2024, 7, 24),
      to: new Date(2024, 7, 26),
    });
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange, selectedLocation, selectedDepartment, selectedEmployee]);

    const husinStats = useMemo(() => {
        const today = new Date(2024, 7, 26);
        const todayNormalized = startOfDay(today);

        const stats = {
            inOffice: { count: 0, list: [] as Employee[] },
            remote: { count: 0, list: [] as Employee[] },
            onBreak: { count: 0, list: [] as Employee[] },
            onVacation: { count: 0, list: [] as Employee[] },
            absent: { count: 0, list: [] as Employee[] },
        };

        const employeesOnLeaveToday = new Set<string>();
        absencesData.forEach(absence => {
            const employee = employees.find(e => e.name === absence.employee);
            if (employee && isWithinInterval(today, { start: absence.from, end: absence.to })) {
                if (absence.type === "De Vacaciones") {
                    stats.onVacation.list.push(employee);
                }
                employeesOnLeaveToday.add(absence.employee);
            }
        });

        const todaysLog = attendanceLog.filter(log => startOfDay(log.date).getTime() === todayNormalized.getTime());

        const latestLogs: { [key: string]: any } = {};
        todaysLog.forEach(log => {
            if (!employeesOnLeaveToday.has(log.employee)) {
                if (!latestLogs[log.employee] || parseAMPM(log.time) > parseAMPM(latestLogs[log.employee].time)) {
                    latestLogs[log.employee] = log;
                }
            }
        });

        const presentEmployees = new Set<string>();
        Object.values(latestLogs).forEach(log => {
            const employee = employees.find(e => e.name === log.employee);
            if (!employee) return;
            
            presentEmployees.add(log.employee);

            switch (log.status) {
                case "Entrada Marcada":
                    if (log.location === "Oficina") {
                        stats.inOffice.list.push(employee);
                    } else {
                        stats.remote.list.push(employee);
                    }
                    break;
                case "En Descanso":
                    stats.onBreak.list.push(employee);
                    break;
            }
        });

        stats.absent.list = employees.filter(emp => !presentEmployees.has(emp.name) && !employeesOnLeaveToday.has(emp.name));

        stats.inOffice.count = stats.inOffice.list.length;
        stats.remote.count = stats.remote.list.length;
        stats.onBreak.count = stats.onBreak.list.length;
        stats.onVacation.count = stats.onVacation.list.length;
        stats.absent.count = stats.absent.list.length;

        return stats;
    }, []);

    const filteredLog = useMemo(() => {
        const startDate = dateRange?.from ? startOfDay(dateRange.from) : null;
        const endDate = dateRange?.to ? startOfDay(dateRange.to) : startDate;

        return attendanceLog.filter(log => {
            const locationMatch = selectedLocation === 'all' || log.location === selectedLocation;
            const departmentMatch = selectedDepartment === 'all' || log.department === selectedDepartment;
            const employeeMatch = selectedEmployee === 'all' || log.employee === selectedEmployee;

            const dateMatch = (() => {
                if (!startDate || !endDate) return true;
                const currentDate = startOfDay(log.date);
                return currentDate >= startDate && currentDate <= endDate;
            })();

            return dateMatch && locationMatch && departmentMatch && employeeMatch;
        });
    }, [dateRange, selectedLocation, selectedDepartment, selectedEmployee]);

    const { paginatedLog, totalPages } = useMemo(() => {
        const total = Math.ceil(filteredLog.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        return {
            paginatedLog: filteredLog.slice(startIndex, startIndex + itemsPerPage),
            totalPages: total > 0 ? total : 1,
        };
    }, [filteredLog, currentPage]);

    const getStatusVariant = (status: string) => {
      switch (status) {
        case "Entrada Marcada": return "active";
        case "Salida Marcada": return "destructive";
        case "En Descanso": return "warning";
        default: return "secondary";
      }
    };

  const HusinCardContent = ({ employees }: { employees: Employee[] }) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div key={emp.id} className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt={emp.name} />
                <AvatarFallback className="text-xs">
                  {emp.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>{emp.name}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">No hay empleados.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tiempo y Asistencia</h1>
        <p className="text-muted-foreground">Monitorea las entradas diarias, estados y cronogramas.</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Husin (Quién está dentro)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-start">
            <div className="relative">
                <Collapsible>
                    <CollapsibleTrigger className="w-full text-left">
                        <Card className="bg-gradient-accent-to-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">En Oficina</CardTitle>
                                <Home className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{husinStats.inOffice.count}</div>
                            </CardContent>
                        </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute z-10 w-full">
                        <HusinCardContent employees={husinStats.inOffice.list} />
                    </CollapsibleContent>
                </Collapsible>
            </div>
            
            <div className="relative">
                <Collapsible>
                    <CollapsibleTrigger className="w-full text-left">
                        <Card className="bg-gradient-accent-to-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Trabajo Remoto</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{husinStats.remote.count}</div>
                            </CardContent>
                        </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute z-10 w-full">
                        <HusinCardContent employees={husinStats.remote.list} />
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="relative">
                <Collapsible>
                    <CollapsibleTrigger className="w-full text-left">
                        <Card className="bg-gradient-accent-to-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">En Descanso</CardTitle>
                                <Coffee className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{husinStats.onBreak.count}</div>
                            </CardContent>
                        </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute z-10 w-full">
                        <HusinCardContent employees={husinStats.onBreak.list} />
                    </CollapsibleContent>
                </Collapsible>
            </div>

             <div className="relative">
                <Collapsible>
                    <CollapsibleTrigger className="w-full text-left">
                        <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">De Vacaciones</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{husinStats.onVacation.count}</div>
                        </CardContent>
                        </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute z-10 w-full">
                        <HusinCardContent employees={husinStats.onVacation.list} />
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className="relative">
                <Collapsible>
                    <CollapsibleTrigger className="w-full text-left">
                        <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ausente</CardTitle>
                            <UserX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{husinStats.absent.count}</div>
                        </CardContent>
                        </Card>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="absolute z-10 w-full">
                        <HusinCardContent employees={husinStats.absent.list} />
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
      </div>
      
      <Card className="bg-gradient-accent-to-card">
        <CardHeader>
          <CardTitle>Timeline de Fichajes</CardTitle>
          <CardDescription>Un registro en tiempo real de los eventos de entrada del día seleccionado.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:items-start border-t border-border mt-4">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                              id="date"
                              variant={"outline"}
                              className={cn(
                                "w-full sm:w-auto md:w-[260px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                              )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "d MMM, y", { locale: es })} - {format(dateRange.to, "d MMM, y", { locale: es })}
                                </>
                            ) : (
                                format(dateRange.from, "d MMM, y", { locale: es })
                            )
                            ) : (
                            <span>Elige un rango de fechas</span>
                            )}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-4 border-b">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                    <Label htmlFor="date-from">Desde</Label>
                                    <Input
                                        id="date-from"
                                        type="date"
                                        value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const fromValue = e.target.value;
                                            setDateRange(prev => {
                                                const fromDate = fromValue ? parse(fromValue, 'yyyy-MM-dd', new Date()) : undefined;
                                                const newFrom = (fromDate && !isNaN(fromDate.getTime())) ? fromDate : undefined;

                                                if (!newFrom) {
                                                    return undefined; 
                                                }

                                                const currentTo = prev?.to;
                                                if (currentTo && newFrom > currentTo) {
                                                    return { from: newFrom, to: undefined };
                                                }
                                                return { from: newFrom, to: currentTo };
                                            });
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="date-to">Hasta</Label>
                                    <Input
                                        id="date-to"
                                        type="date"
                                        value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                                        min={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined}
                                        onChange={(e) => {
                                            const toValue = e.target.value;
                                            setDateRange(prev => {
                                                if (!prev?.from) {
                                                    return prev;
                                                }
                                                const toDate = toValue ? parse(toValue, 'yyyy-MM-dd', new Date()) : undefined;
                                                const validToDate = (toDate && !isNaN(toDate.getTime())) ? toDate : undefined;
                                                
                                                return { from: prev.from, to: validToDate };
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
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

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-auto md:w-[180px]">
                    <SelectValue placeholder="Ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Ubicaciones</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-auto md:w-[180px]">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Deptos.</SelectItem>
                    {allDepartments.map(dept => (
                         <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                 <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-full sm:w-auto md:w-[180px]">
                        <SelectValue placeholder="Empleado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Empleados</SelectItem>
                        {availableEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                        ))}
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
              {paginatedLog.length > 0 ? paginatedLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.employee}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(log.status)}>
                      {log.status}
                    </Badge>
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
        <CardFooter className="pt-4">
            <div className="flex w-full items-center justify-end space-x-2">
                <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}
