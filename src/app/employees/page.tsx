'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MoreHorizontal, PlusCircle, Search, UploadCloud, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type CalendarData = {
    id: string;
    name: string;
    holidays: { id: string, name: string, date: string }[];
};

type VacationPolicy = {
  id: string;
  name: string;
  unit: 'days' | 'hours';
  amount: number;
  countBy: 'natural' | 'workdays';
  limitRequests: boolean;
  blockPeriods: boolean;
};

type Employee = {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    status: string;
    schedule: string;
    avatar: string;
    workCenter: string;
    vacationManager: string;
    clockInManager: string;
    calendarId?: string;
    vacationPolicyId?: string;
}

const initialEmployees: Employee[] = [
  { id: 1, name: "Olivia Martin", email: "olivia.martin@example.com", department: "Ingeniería", role: "Desarrollador Frontend", status: "Activo", schedule: "9-5", avatar: "OM", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
  { id: 2, name: "Jackson Lee", email: "jackson.lee@example.com", department: "Diseño", role: "Diseñador UI/UX", status: "Activo", schedule: "10-6", avatar: "JL", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
  { id: 3, name: "Isabella Nguyen", email: "isabella.nguyen@example.com", department: "Marketing", role: "Estratega de Contenido", status: "Activo", schedule: "9-5", avatar: "IN", workCenter: "Remoto", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
  { id: 4, name: "William Kim", email: "will.kim@example.com", department: "Ingeniería", role: "Desarrollador Backend", status: "De Licencia", schedule: "9-5", avatar: "WK", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
  { id: 5, name: "Sophia Davis", email: "sophia.davis@example.com", department: "Ventas", role: "Ejecutivo de Cuentas", status: "Activo", schedule: "Flex", avatar: "SD", workCenter: "Almacén Norte", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
  { id: 6, name: "Liam Garcia", email: "liam.garcia@example.com", department: "RRHH", role: "Generalista de RRHH", status: "Activo", schedule: "8-4", avatar: "LG", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
];

const EMPLOYEES_STORAGE_KEY = 'workflow-central-employees';
const CALENDARS_STORAGE_KEY = 'workflow-central-calendars';
const VACATION_POLICIES_STORAGE_KEY = 'workflow-central-vacation-policies';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [vacationPolicies, setVacationPolicies] = useState<VacationPolicy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const storedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
        if (storedEmployees) {
          setEmployees(JSON.parse(storedEmployees));
        } else {
          localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(initialEmployees));
        }
        
        const storedCalendars = localStorage.getItem(CALENDARS_STORAGE_KEY);
        if (storedCalendars) {
          setCalendars(JSON.parse(storedCalendars));
        }

        const storedPolicies = localStorage.getItem(VACATION_POLICIES_STORAGE_KEY);
        if (storedPolicies) {
          setVacationPolicies(JSON.parse(storedPolicies));
        }

      } catch (error) {
        console.error("Failed to access localStorage", error);
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    }
  }, [employees, isClient]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    schedule: "",
    workCenter: "",
    vacationManager: "",
    clockInManager: "",
    calendarId: "",
    vacationPolicyId: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setSelectedEmployee(null);
    setFormData({ name: "", email: "", department: "", role: "", schedule: "", workCenter: "", vacationManager: "", clockInManager: "", calendarId: "", vacationPolicyId: "" });
    setIsDialogOpen(true);
  }

  const openEditDialog = (employee: Employee) => {
    setDialogMode('edit');
    setSelectedEmployee(employee);
    setFormData({
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        schedule: employee.schedule,
        workCenter: employee.workCenter,
        vacationManager: employee.vacationManager || "",
        clockInManager: employee.clockInManager || "",
        calendarId: employee.calendarId || "",
        vacationPolicyId: employee.vacationPolicyId || "",
    });
    setIsDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return; 

    if (dialogMode === 'add') {
        const newId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
        const avatar = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
        setEmployees(prev => [...prev, {
          id: newId,
          ...formData,
          status: "Activo",
          avatar: avatar,
        }]);
    } else if (dialogMode === 'edit' && selectedEmployee) {
        setEmployees(prev => prev.map(emp => 
            emp.id === selectedEmployee.id ? { ...emp, ...formData, avatar: emp.avatar, status: emp.status } : emp
        ));
    }
    setIsDialogOpen(false);
  };
  
  const handleToggleStatus = (employeeId: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const newStatus = emp.status === "Activo" ? "Deshabilitado" : "Activo";
        return { ...emp, status: newStatus };
      }
      return emp;
    }));
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };
  
  const getStatusBadgeClass = (status: string) => {
      switch (status) {
          case "Activo":
              return "bg-accent text-accent-foreground border-transparent";
          case "Deshabilitado":
              return "bg-secondary text-secondary-foreground border-transparent";
          case "De Licencia":
              return "bg-warning text-warning-foreground border-transparent";
          default:
              return "";
      }
  }

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Gestión de Empleados</h1>
        <p className="text-muted-foreground">Ver, gestionar y exportar datos de empleados.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar empleados..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Ingeniería</SelectItem>
                  <SelectItem value="design">Diseño</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="hr">RRHH</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button onClick={openAddDialog} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Empleado
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead className="hidden lg:table-cell">Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Centro</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt={employee.name} />
                        <AvatarFallback>{employee.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{employee.department}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.workCenter}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(employee.id)}>
                            {employee.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEmployee(employee.id)}>
                            Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {dialogMode === 'add' ? 'Añadir Nuevo Empleado' : 'Editar Empleado'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'add' ? 'Rellena los datos para añadir un nuevo miembro al equipo.' : `Editando el perfil de ${selectedEmployee?.name}.`}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="individual" className="w-full">
                {dialogMode === 'add' && (
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual">Individual</TabsTrigger>
                        <TabsTrigger value="multiple">Múltiple</TabsTrigger>
                    </TabsList>
                )}
                <TabsContent value="individual">
                    <form onSubmit={handleFormSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Ej. Juan Pérez" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="juan@ejemplo.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Departamento</Label>
                           <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                            <SelectTrigger id="department">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                              <SelectItem value="Diseño">Diseño</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Ventas">Ventas</SelectItem>
                              <SelectItem value="RRHH">RRHH</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Cargo</Label>
                          <Input id="role" value={formData.role} onChange={handleInputChange} placeholder="Ej. Desarrollador Frontend" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="workCenter">Centro de Trabajo</Label>
                           <Select value={formData.workCenter} onValueChange={(value) => handleSelectChange('workCenter', value)}>
                            <SelectTrigger id="workCenter">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Oficina Central">Oficina Central</SelectItem>
                              <SelectItem value="Almacén Norte">Almacén Norte</SelectItem>
                              <SelectItem value="Remoto">Remoto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="vacationManager">Responsable de Aprobación de Vacaciones</Label>
                            <Select value={formData.vacationManager} onValueChange={(value) => handleSelectChange('vacationManager', value)}>
                                <SelectTrigger id="vacationManager">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => <SelectItem key={`${e.id}-vac`} value={e.name}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clockInManager">Responsable de Aprobación de Fichajes</Label>
                            <Select value={formData.clockInManager} onValueChange={(value) => handleSelectChange('clockInManager', value)}>
                                <SelectTrigger id="clockInManager">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => <SelectItem key={`${e.id}-clock`} value={e.name}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule">Horario</Label>
                          <Input id="schedule" value={formData.schedule} onChange={handleInputChange} placeholder="Ej. 9-5, Fijo, Flexible" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="calendarId">Calendario Laboral</Label>
                            <Select value={formData.calendarId} onValueChange={(value) => handleSelectChange('calendarId', value)}>
                                <SelectTrigger id="calendarId">
                                <SelectValue placeholder="Seleccionar Calendario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {calendars.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="vacationPolicyId">Política de Vacaciones</Label>
                            <Select value={formData.vacationPolicyId} onValueChange={(value) => handleSelectChange('vacationPolicyId', value)}>
                                <SelectTrigger id="vacationPolicyId">
                                <SelectValue placeholder="Seleccionar Política" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vacationPolicies.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{dialogMode === 'add' ? 'Añadir Empleado' : 'Guardar Cambios'}</Button>
                      </DialogFooter>
                    </form>
                </TabsContent>
                <TabsContent value="multiple">
                    <div className="py-4 space-y-4 text-center">
                        <p className="text-muted-foreground">Sube un archivo de Excel o envía un enlace de invitación para añadir múltiples empleados a la vez.</p>
                        <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Subir Excel</Button>
                        <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" /> Enviar Invitaciones</Button>
                    </div>
                </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

    </div>
  )
}
