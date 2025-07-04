
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CalendarClock, Briefcase, UserPlus, SlidersHorizontal, Sun, Moon, Coffee, Timer, CalendarDays, Plane, Bell, Bot, Lock, Puzzle, List, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const allPermissions = [
  { id: 'view_dashboard', label: 'Ver Panel Principal' },
  { id: 'manage_employees', label: 'Gestionar Empleados (Ver, Crear, Editar)' },
  { id: 'manage_attendance', label: 'Gestionar Asistencia y Fichajes' },
  { id: 'manage_absences', label: 'Gestionar Ausencias y Aprobaciones' },
  { id: 'manage_projects', label: 'Gestionar Proyectos y Tareas' },
  { id: 'manage_performance', label: 'Gestionar Evaluaciones de Desempeño' },
  { id: 'manage_documents', label: 'Gestionar Documentos de la Empresa' },
  { id: 'manage_reports', label: 'Generar Informes de Empresa' },
  { id: 'manage_settings', label: 'Gestionar Configuración de la Empresa' },
  { id: 'manage_roles', label: 'Gestionar Roles y Permisos' },
];

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
    manager: string;
};

const EMPLOYEES_STORAGE_KEY = 'workflow-central-employees';

type Center = {
  name: string;
  address: string;
  radius: number;
};

type Department = {
  name: string;
};

type Role = {
  name: string;
  description: string;
  permissions: string[];
};

type Break = {
  name: string;
  remunerated: boolean;
  limit: number; // in minutes
  isAutomatic: boolean;
  intervalStart?: string;
  intervalEnd?: string;
  notifyStart: boolean;
  notifyEnd: boolean;
  assignedTo: string[];
};

type ClockInType = {
  name: string;
  color: string;
  assignment: 'all' | 'specific';
  assignedTo: string[];
};

const initialCenters: Center[] = [
  { name: "Oficina Central", address: "123 Calle Principal, Anytown", radius: 100 },
  { name: "Almacén Norte", address: "456 Avenida Industrial, Anytown", radius: 150 },
];
const initialDepartments: Department[] = [
  { name: "Ingeniería" },
  { name: "Diseño" },
  { name: "Marketing" },
  { name: "Ventas" },
  { name: "RRHH" },
];
const initialRoles: Role[] = [
  { name: "Propietario", description: "Control total sobre la cuenta.", permissions: allPermissions.map(p => p.id) },
  { name: "Administrador", description: "Acceso a todo excepto la gestión de roles.", permissions: allPermissions.filter(p => p.id !== 'manage_roles').map(p => p.id) },
  { name: "Recursos Humanos", description: "Gestiona personal, pero no la configuración.", permissions: ['view_dashboard', 'manage_employees', 'manage_attendance', 'manage_absences', 'manage_performance', 'manage_documents'] },
  { name: "Manager", description: "Gestiona equipos o personas específicas.", permissions: ['view_dashboard', 'manage_attendance', 'manage_absences'] },
];
const initialBreaks: Break[] = [
    { name: "Descanso de Comida", remunerated: false, limit: 60, isAutomatic: false, intervalStart: "13:00", intervalEnd: "15:00", notifyStart: true, notifyEnd: true, assignedTo: ["Turno de Mañana", "Turno de Tarde"] },
    { name: "Pausa para Café", remunerated: true, limit: 15, isAutomatic: false, intervalStart: "", intervalEnd: "", notifyStart: false, notifyEnd: false, assignedTo: ["Turno de Mañana", "Turno de Tarde", "Turno de Noche"] },
]
const initialClockInTypes: ClockInType[] = [
    { name: "Reunión", color: "bg-blue-500", assignment: 'all', assignedTo: [] },
    { name: "Viaje de Trabajo", color: "bg-purple-500", assignment: 'all', assignedTo: [] },
    { name: "Comida de negocios", color: "bg-orange-500", assignment: 'all', assignedTo: [] },
];

const CENTERS_STORAGE_KEY = 'workflow-central-centers';
const DEPARTMENTS_STORAGE_KEY = 'workflow-central-departments';
const ROLES_STORAGE_KEY = 'workflow-central-roles';
const BREAKS_STORAGE_KEY = 'workflow-central-breaks';
const CLOCK_IN_TYPES_STORAGE_KEY = 'workflow-central-clock-in-types';

const projectColors = [
    { value: 'bg-blue-500', label: 'Azul' },
    { value: 'bg-purple-500', label: 'Morado' },
    { value: 'bg-green-500', label: 'Verde' },
    { value: 'bg-orange-500', label: 'Naranja' },
    { value: 'bg-red-500', label: 'Rojo' },
    { value: 'bg-gray-500', label: 'Gris' },
];

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false);

  const [centers, setCenters] = useState<Center[]>(initialCenters);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [breaks, setBreaks] = useState<Break[]>(initialBreaks);
  const [clockInTypes, setClockInTypes] = useState<ClockInType[]>(initialClockInTypes);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [dialogCenterMode, setDialogCenterMode] = useState<'add' | 'edit'>('add');
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [newCenterData, setNewCenterData] = useState({ name: "", address: "", radius: 100 });
  
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [dialogDeptMode, setDialogDeptMode] = useState<'add' | 'edit'>('add');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState("");

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [dialogRoleMode, setDialogRoleMode] = useState<'add' | 'edit'>('add');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<Role>({ name: '', description: '', permissions: [] });
  
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [dialogBreakMode, setDialogBreakMode] = useState<'add' | 'edit'>('add');
  const [selectedBreak, setSelectedBreak] = useState<Break | null>(null);
  const [breakFormData, setBreakFormData] = useState<Break>({ name: "", remunerated: false, limit: 30, isAutomatic: false, intervalStart: "", intervalEnd: "", notifyStart: false, notifyEnd: false, assignedTo: [] });
  
  const [isClockInTypeDialogOpen, setIsClockInTypeDialogOpen] = useState(false);
  const [dialogClockInTypeMode, setDialogClockInTypeMode] = useState<'add' | 'edit'>('add');
  const [selectedClockInType, setSelectedClockInType] = useState<ClockInType | null>(null);
  const [clockInTypeFormData, setClockInTypeFormData] = useState<ClockInType>({ name: "", color: "bg-blue-500", assignment: 'all', assignedTo: [] });

  const absenceTypes = [
    { name: "Vacaciones", remunerated: true, limit: "Anual" },
    { name: "Licencia por enfermedad", remunerated: true, limit: "Sin límite" },
    { name: "Teletrabajo", remunerated: true, limit: "Sin límite" },
  ];

  const shifts = [
    { name: "Turno de Mañana", start: "06:00", end: "14:00" },
    { name: "Turno de Tarde", start: "14:00", end: "22:00" },
    { name: "Turno de Noche", start: "22:00", end: "06:00" },
  ];
  const allSchedules = ['Horario Fijo', 'Horario Flexible', ...shifts.map(s => s.name)];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const storedCenters = localStorage.getItem(CENTERS_STORAGE_KEY);
        if (storedCenters) {
          setCenters(JSON.parse(storedCenters));
        } else {
          setCenters(initialCenters);
          localStorage.setItem(CENTERS_STORAGE_KEY, JSON.stringify(initialCenters));
        }

        const storedDepts = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
        if (storedDepts) {
          setDepartments(JSON.parse(storedDepts));
        } else {
          setDepartments(initialDepartments);
          localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(initialDepartments));
        }
        
        const storedRoles = localStorage.getItem(ROLES_STORAGE_KEY);
        if (storedRoles) {
          setRoles(JSON.parse(storedRoles));
        } else {
          setRoles(initialRoles);
          localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(initialRoles));
        }
        
        const storedBreaks = localStorage.getItem(BREAKS_STORAGE_KEY);
        if (storedBreaks) {
          const parsed = JSON.parse(storedBreaks);
          // Data migration: ensure `assignedTo` is always an array to prevent crashes from old data.
          const migrated = parsed.map((b: any) => ({...b, assignedTo: b.assignedTo || []}));
          setBreaks(migrated);
        } else {
          setBreaks(initialBreaks);
          localStorage.setItem(BREAKS_STORAGE_KEY, JSON.stringify(initialBreaks));
        }

        const storedClockInTypes = localStorage.getItem(CLOCK_IN_TYPES_STORAGE_KEY);
        if (storedClockInTypes) {
            const parsed = JSON.parse(storedClockInTypes);
            const migrated = parsed.map((t: any) => ({
                ...t,
                assignment: t.assignment || 'all',
                assignedTo: t.assignedTo || [],
            }));
            setClockInTypes(migrated);
        }
        else {
            setClockInTypes(initialClockInTypes);
            localStorage.setItem(CLOCK_IN_TYPES_STORAGE_KEY, JSON.stringify(initialClockInTypes));
        }
        
        const storedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
        if (storedEmployees) setEmployees(JSON.parse(storedEmployees));

      } catch (error) {
        console.error("Failed to access localStorage", error);
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(CENTERS_STORAGE_KEY, JSON.stringify(centers));
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
      localStorage.setItem(BREAKS_STORAGE_KEY, JSON.stringify(breaks));
      localStorage.setItem(CLOCK_IN_TYPES_STORAGE_KEY, JSON.stringify(clockInTypes));
    }
  }, [centers, departments, roles, breaks, clockInTypes, isClient]);


  const openAddRoleDialog = () => {
    setDialogRoleMode('add');
    setSelectedRole(null);
    setRoleFormData({ name: '', description: '', permissions: [] });
    setIsRoleDialogOpen(true);
  };

  const openEditRoleDialog = (role: Role) => {
    setDialogRoleMode('edit');
    setSelectedRole(role);
    setRoleFormData({ name: role.name, description: role.description, permissions: [...role.permissions] });
    setIsRoleDialogOpen(true);
  };

  const handleRoleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name) return;

    if (dialogRoleMode === 'add') {
      setRoles(prev => [...prev, roleFormData]);
    } else if (dialogRoleMode === 'edit' && selectedRole) {
      setRoles(prev => prev.map(r => (r.name === selectedRole.name ? roleFormData : r)));
    }
    setIsRoleDialogOpen(false);
  };

  const openAddCenterDialog = () => {
    setDialogCenterMode('add');
    setSelectedCenter(null);
    setNewCenterData({ name: "", address: "", radius: 100 });
    setIsCenterDialogOpen(true);
  };

  const openEditCenterDialog = (center: Center) => {
    setDialogCenterMode('edit');
    setSelectedCenter(center);
    setNewCenterData(center);
    setIsCenterDialogOpen(true);
  };

  const handleCenterFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterData.name || !newCenterData.address) return;
    const centerPayload = { ...newCenterData, radius: Number(newCenterData.radius) };

    if (dialogCenterMode === 'add') {
        setCenters(prev => [...prev, centerPayload]);
    } else if (dialogCenterMode === 'edit' && selectedCenter) {
        setCenters(prev => prev.map(c => (c.name === selectedCenter.name ? centerPayload : c)));
    }
    setIsCenterDialogOpen(false);
  };

  const handleDeleteCenter = (centerName: string) => {
    setCenters(prev => prev.filter(c => c.name !== centerName));
  };
  
  const openAddDeptDialog = () => {
    setDialogDeptMode('add');
    setSelectedDepartment(null);
    setNewDepartmentName("");
    setIsDeptDialogOpen(true);
  };
  
  const openEditDeptDialog = (department: Department) => {
    setDialogDeptMode('edit');
    setSelectedDepartment(department);
    setNewDepartmentName(department.name);
    setIsDeptDialogOpen(true);
  };

  const handleDepartmentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName) return;

    if (dialogDeptMode === 'add') {
      setDepartments(prev => [...prev, { name: newDepartmentName }]);
    } else if (dialogDeptMode === 'edit' && selectedDepartment) {
      setDepartments(prev => prev.map(d => (d.name === selectedDepartment.name ? { name: newDepartmentName } : d)));
    }

    setNewDepartmentName("");
    setIsDeptDialogOpen(false);
  };
  
  const handleDeleteDepartment = (departmentName: string) => {
      setDepartments(prev => prev.filter(d => d.name !== departmentName));
  };
  
  const openAddBreakDialog = () => {
    setDialogBreakMode('add');
    setSelectedBreak(null);
    setBreakFormData({ name: "", remunerated: false, limit: 30, isAutomatic: false, intervalStart: "", intervalEnd: "", notifyStart: false, notifyEnd: false, assignedTo: [] });
    setIsBreakDialogOpen(true);
  };

  const openEditBreakDialog = (br: Break) => {
    setDialogBreakMode('edit');
    setSelectedBreak(br);
    setBreakFormData(br);
    setIsBreakDialogOpen(true);
  };

  const handleBreakFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakFormData.name) return;
    
    const payload = {...breakFormData, limit: Number(breakFormData.limit)};

    if (dialogBreakMode === 'add') {
        setBreaks(prev => [...prev, payload]);
    } else if (dialogBreakMode === 'edit' && selectedBreak) {
        setBreaks(prev => prev.map(b => (b.name === selectedBreak.name ? payload : b)));
    }
    setIsBreakDialogOpen(false);
  };
  
  const handleDeleteBreak = (breakName: string) => {
    setBreaks(prev => prev.filter(b => b.name !== breakName));
  };
  
  const openAddClockInTypeDialog = () => {
    setDialogClockInTypeMode('add');
    setSelectedClockInType(null);
    setClockInTypeFormData({ name: "", color: "bg-blue-500", assignment: 'all', assignedTo: [] });
    setIsClockInTypeDialogOpen(true);
  };

  const openEditClockInTypeDialog = (type: ClockInType) => {
    setDialogClockInTypeMode('edit');
    setSelectedClockInType(type);
    setClockInTypeFormData(type);
    setIsClockInTypeDialogOpen(true);
  };

  const handleClockInTypeFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockInTypeFormData.name) return;

    if (dialogClockInTypeMode === 'add') {
      setClockInTypes(prev => [...prev, clockInTypeFormData]);
    } else if (dialogClockInTypeMode === 'edit' && selectedClockInType) {
      setClockInTypes(prev => prev.map(t => (t.name === selectedClockInType.name ? clockInTypeFormData : t)));
    }
    setIsClockInTypeDialogOpen(false);
  };

  const handleDeleteClockInType = (typeName: string) => {
    setClockInTypes(prev => prev.filter(t => t.name !== typeName));
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de la cuenta y de la organización.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4" orientation="vertical">
        <TabsList className="w-full md:w-48 h-auto flex-col items-start">
          <TabsTrigger value="general" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4"/>General</TabsTrigger>
          <TabsTrigger value="roles" className="w-full justify-start"><ShieldCheck className="mr-2 h-4 w-4"/>Roles</TabsTrigger>
          <TabsTrigger value="centers" className="w-full justify-start"><UserPlus className="mr-2 h-4 w-4"/>Centros y Deptos.</TabsTrigger>
          <Separator className="my-2"/>
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">TIEMPO</p>
          <TabsTrigger value="schedules" className="w-full justify-start"><CalendarClock className="mr-2 h-4 w-4"/>Horarios</TabsTrigger>
          <TabsTrigger value="breaks" className="w-full justify-start"><Coffee className="mr-2 h-4 w-4"/>Descansos</TabsTrigger>
          <TabsTrigger value="checkin-types" className="w-full justify-start"><SlidersHorizontal className="mr-2 h-4 w-4"/>Tipos de Fichaje</TabsTrigger>
          <TabsTrigger value="calendars" className="w-full justify-start"><CalendarDays className="mr-2 h-4 w-4"/>Calendarios</TabsTrigger>
          <TabsTrigger value="vacations" className="w-full justify-start"><Plane className="mr-2 h-4 w-4"/>Vacaciones</TabsTrigger>
          <TabsTrigger value="absences" className="w-full justify-start"><Plane className="mr-2 h-4 w-4"/>Ausencias</TabsTrigger>
          <Separator className="my-2"/>
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">CUENTA</p>
          <TabsTrigger value="automations" className="w-full justify-start"><Bot className="mr-2 h-4 w-4"/>Automatizaciones</TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start"><Bell className="mr-2 h-4 w-4"/>Notificaciones</TabsTrigger>
          <TabsTrigger value="permissions" className="w-full justify-start"><Lock className="mr-2 h-4 w-4"/>Permisos</TabsTrigger>
          <TabsTrigger value="integrations" className="w-full justify-start"><Puzzle className="mr-2 h-4 w-4"/>Integraciones</TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start"><Lock className="mr-2 h-4 w-4"/>Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Detalles de la Empresa</CardTitle>
              <CardDescription>Actualiza la información de tu organización.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input id="companyName" defaultValue="WorkFlow Central" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogo">Logo de la Empresa</Label>
                <Input id="companyLogo" type="file" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Roles de Usuario</CardTitle>
                <CardDescription>Indica qué usuarios tendrán más visibilidad o control.</CardDescription>
              </div>
               <Button onClick={openAddRoleDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Rol</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.map((role, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEditRoleDialog(role)}>Editar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-headline">
                  {dialogRoleMode === 'add' ? 'Añadir Nuevo Rol' : 'Editar Rol'}
                </DialogTitle>
                <DialogDescription>
                  {dialogRoleMode === 'add' ? 'Define un nuevo rol y sus permisos.' : `Editando el rol de ${selectedRole?.name}.`}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRoleFormSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Nombre del Rol</Label>
                    <Input 
                      id="role-name" 
                      value={roleFormData.name} 
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))} 
                      placeholder="Ej. Manager de Proyecto" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Descripción</Label>
                    <Textarea 
                      id="role-description" 
                      value={roleFormData.description} 
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))} 
                      placeholder="Describe las responsabilidades de este rol." 
                    />
                  </div>
                   <div className="space-y-2">
                    <Label>Permisos</Label>
                    <ScrollArea className="h-48 rounded-md border p-4">
                      <div className="space-y-3">
                        {allPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={roleFormData.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                setRoleFormData(prev => ({
                                  ...prev,
                                  permissions: checked
                                    ? [...prev.permissions, permission.id]
                                    : prev.permissions.filter(p => p !== permission.id)
                                }));
                              }}
                            />
                            <Label htmlFor={`perm-${permission.id}`} className="font-normal -mt-1 cursor-pointer">{permission.label}</Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{dialogRoleMode === 'add' ? 'Añadir Rol' : 'Guardar Cambios'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Centros de Trabajo</CardTitle>
                <CardDescription>Configura las ubicaciones de tu empresa para fichajes con geolocalización.</CardDescription>
              </div>
               <Dialog open={isCenterDialogOpen} onOpenChange={setIsCenterDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openAddCenterDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Centro</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-headline">{dialogCenterMode === 'add' ? 'Nuevo Centro de Trabajo' : 'Editar Centro de Trabajo'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleCenterFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="center-name">Nombre del Centro</Label>
                                <Input id="center-name" placeholder="Ej. Oficina Principal" value={newCenterData.name} onChange={(e) => setNewCenterData({...newCenterData, name: e.target.value})} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="center-address">Dirección</Label>
                                <Input id="center-address" placeholder="Ej. 123 Calle Falsa" value={newCenterData.address} onChange={(e) => setNewCenterData({...newCenterData, address: e.target.value})} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="center-radius">Radio de Geolocalización (metros)</Label>
                                <Input id="center-radius" type="number" placeholder="Ej. 100" value={newCenterData.radius} onChange={(e) => setNewCenterData({...newCenterData, radius: parseInt(e.target.value) || 0})}/>
                            </div>
                        </div>
                        <DialogFooter><Button type="submit">Guardar Centro</Button></DialogFooter>
                    </form>
                </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {centers.map((center, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{center.name}</h3>
                    <p className="text-sm text-muted-foreground">{center.address} (Radio: {center.radius}m)</p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => openEditCenterDialog(center)}>Editar</Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCenter(center.name)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Departamentos</CardTitle>
                <CardDescription>Organiza a tus empleados en diferentes departamentos.</CardDescription>
              </div>
               <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild><Button onClick={openAddDeptDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Depto.</Button></DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader><DialogTitle className="font-headline">{dialogDeptMode === 'add' ? 'Nuevo Departamento' : 'Editar Departamento'}</DialogTitle></DialogHeader>
                    <form onSubmit={handleDepartmentFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="dept-name">Nombre del Departamento</Label>
                                <Input id="dept-name" placeholder="Ej. Soporte Técnico" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} required/>
                            </div>
                        </div>
                        <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                    </form>
                </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <h3 className="font-semibold">{dept.name}</h3>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => openEditDeptDialog(dept)}>Editar</Button>
                     <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDepartment(dept.name)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tipos de Horario</CardTitle>
              <CardDescription>Configura los diferentes tipos de horarios que los empleados pueden tener.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Flexible</h3>
                  <p className="text-sm text-muted-foreground">Se establecen días laborables y un total de horas a cumplir.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">Configurar Horario Flexible</DialogTitle>
                      <DialogDescription>Establece los días laborables y el total de horas a cumplir.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="weekly-hours">Total de horas semanales</Label>
                        <Input id="weekly-hours" type="number" defaultValue="40" />
                      </div>
                      <div className="space-y-2">
                        <Label>Días laborables</Label>
                        <div className="flex gap-4 flex-wrap pt-2">
                          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={day} className="flex items-center gap-1.5">
                              <Checkbox id={`day-${i}`} defaultChecked={i < 5} />
                              <Label htmlFor={`day-${i}`} className="font-normal">{day}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Guardar Cambios</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Fijo</h3>
                  <p className="text-sm text-muted-foreground">Se establecen horas de entrada y salida fijas.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">Configurar Horario Fijo</DialogTitle>
                      <DialogDescription>Establece las horas de entrada y salida fijas para la jornada.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Hora de Entrada</Label>
                          <Input id="start-time" type="time" defaultValue="09:00" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time">Hora de Salida</Label>
                          <Input id="end-time" type="time" defaultValue="17:00" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="split-shift" />
                        <Label htmlFor="split-shift" className="font-normal">Habilitar jornada partida</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Días laborables</Label>
                        <div className="flex gap-4 flex-wrap pt-2">
                          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={day} className="flex items-center gap-1.5">
                              <Checkbox id={`day-fixed-${i}`} defaultChecked={i < 5} />
                              <Label htmlFor={`day-fixed-${i}`} className="font-normal">{day}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Guardar Cambios</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Turnos</h3>
                  <p className="text-sm text-muted-foreground">Para horarios rotativos y cambiantes.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-headline">Gestionar Turnos</DialogTitle>
                      <DialogDescription>Crea y edita los diferentes turnos para horarios rotativos. Esta es una vista previa, la asignación se realiza en otra sección.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                      {shifts.map((shift, index) => (
                        <div key={index} className="flex items-end gap-2 p-3 border rounded-md bg-muted/50">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`shift-name-${index}`}>Nombre del Turno</Label>
                            <Input id={`shift-name-${index}`} defaultValue={shift.name} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`shift-start-${index}`}>Inicio</Label>
                            <Input id={`shift-start-${index}`} type="time" defaultValue={shift.start} className="w-28"/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`shift-end-${index}`}>Fin</Label>
                            <Input id={`shift-end-${index}`} type="time" defaultValue={shift.end} className="w-28"/>
                          </div>
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4"/> Añadir Nuevo Turno</Button>
                    </div>
                    <DialogFooter>
                      <Button>Guardar Cambios</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="breaks" className="space-y-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Gestión de Descansos</CardTitle>
                        <CardDescription>Configura los descansos, ya sean remunerados o no.</CardDescription>
                    </div>
                    <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openAddBreakDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Descanso</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-headline">{dialogBreakMode === 'add' ? 'Añadir Nuevo Descanso' : 'Editar Descanso'}</DialogTitle>
                                <DialogDescription>Define las propiedades y reglas para este tipo de descanso.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleBreakFormSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="break-name">Nombre del Descanso</Label>
                                        <Input id="break-name" value={breakFormData.name} onChange={(e) => setBreakFormData({...breakFormData, name: e.target.value})} placeholder="Ej. Pausa para Fumar" required/>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="break-remunerated" checked={breakFormData.remunerated} onCheckedChange={(checked) => setBreakFormData({...breakFormData, remunerated: checked})}/>
                                        <Label htmlFor="break-remunerated">Remunerado (cuenta como tiempo trabajado)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="break-automatic" checked={breakFormData.isAutomatic} onCheckedChange={(checked) => setBreakFormData({...breakFormData, isAutomatic: checked})}/>
                                        <Label htmlFor="break-automatic">Descanso Automático</Label>
                                    </div>

                                    {breakFormData.isAutomatic ? (
                                        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                                            <div className="space-y-2">
                                                <Label htmlFor="break-interval-start">Inicio del Intervalo</Label>
                                                <Input id="break-interval-start" type="time" value={breakFormData.intervalStart} onChange={(e) => setBreakFormData({...breakFormData, intervalStart: e.target.value})} required/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="break-interval-end">Fin del Intervalo</Label>
                                                <Input id="break-interval-end" type="time" value={breakFormData.intervalEnd} onChange={(e) => setBreakFormData({...breakFormData, intervalEnd: e.target.value})} required/>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="break-limit">Límite de Tiempo (minutos)</Label>
                                                <Input id="break-limit" type="number" value={breakFormData.limit} onChange={(e) => setBreakFormData({...breakFormData, limit: parseInt(e.target.value) || 0})} placeholder="Ej. 10" required/>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="break-interval-start-optional">Inicio Intervalo (Opcional)</Label>
                                                    <Input id="break-interval-start-optional" type="time" value={breakFormData.intervalStart} onChange={(e) => setBreakFormData({...breakFormData, intervalStart: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="break-interval-end-optional">Fin Intervalo (Opcional)</Label>
                                                    <Input id="break-interval-end-optional" type="time" value={breakFormData.intervalEnd} onChange={(e) => setBreakFormData({...breakFormData, intervalEnd: e.target.value})} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Asignar a Jornadas/Turnos</Label>
                                        <ScrollArea className="h-32 rounded-md border p-4">
                                            <div className="space-y-2">
                                                {allSchedules.map(scheduleName => (
                                                    <div key={scheduleName} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`assign-${scheduleName}`}
                                                            checked={breakFormData.assignedTo.includes(scheduleName)}
                                                            onCheckedChange={(checked) => {
                                                                const newAssignedTo = checked 
                                                                    ? [...breakFormData.assignedTo, scheduleName]
                                                                    : breakFormData.assignedTo.filter(name => name !== scheduleName);
                                                                setBreakFormData({ ...breakFormData, assignedTo: newAssignedTo });
                                                            }}
                                                        />
                                                        <Label htmlFor={`assign-${scheduleName}`} className="font-normal">{scheduleName}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label>Notificaciones</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch id="break-notify-start" checked={breakFormData.notifyStart} onCheckedChange={(checked) => setBreakFormData({...breakFormData, notifyStart: checked})}/>
                                            <Label htmlFor="break-notify-start">Notificar al empleado al inicio</Label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <Switch id="break-notify-end" checked={breakFormData.notifyEnd} onCheckedChange={(checked) => setBreakFormData({...breakFormData, notifyEnd: checked})}/>
                                            <Label htmlFor="break-notify-end">Notificar al empleado al finalizar</Label>
                                        </div>
                                    </div>

                                </div>
                                <DialogFooter>
                                    <Button type="submit">{dialogBreakMode === 'add' ? 'Añadir' : 'Guardar'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                     {breaks.map((br, index) => (
                         <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h3 className="font-semibold">{br.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {br.remunerated ? 'Remunerado' : 'No remunerado'}
                                    {br.isAutomatic 
                                        ? `, Automático (${br.intervalStart || 'N/A'}-${br.intervalEnd || 'N/A'})` 
                                        : `, Límite: ${br.limit} min`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Asignado a: {br.assignedTo?.length > 0 ? br.assignedTo.join(', ') : 'Ninguno'}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <Button variant="ghost" size="sm" onClick={() => openEditBreakDialog(br)}>Editar</Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBreak(br.name)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                     ))}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="checkin-types" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Tipos de Fichaje</CardTitle>
                <CardDescription>Marca fichajes diferentes al normal, asignando un color para diferenciarlos.</CardDescription>
              </div>
              <Dialog open={isClockInTypeDialogOpen} onOpenChange={setIsClockInTypeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddClockInTypeDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-headline">{dialogClockInTypeMode === 'add' ? 'Añadir Nuevo Tipo de Fichaje' : 'Editar Tipo de Fichaje'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleClockInTypeFormSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="clockintype-name">Nombre del Tipo</Label>
                            <Input id="clockintype-name" value={clockInTypeFormData.name} onChange={(e) => setClockInTypeFormData({...clockInTypeFormData, name: e.target.value})} placeholder="Ej. Reunión Cliente" required/>
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <RadioGroup value={clockInTypeFormData.color} onValueChange={(value) => setClockInTypeFormData({...clockInTypeFormData, color: value})} className="flex flex-wrap gap-4 pt-2">
                            {projectColors.map(color => (
                                <div key={color.value} className="flex items-center space-x-2">
                                    <RadioGroupItem 
                                        value={color.value} 
                                        id={`settings-color-${color.value}`}
                                        className="h-6 w-6 border-0 p-0 data-[state=checked]:ring-2 ring-offset-background ring-ring"
                                    >
                                        <div className={`h-full w-full rounded-full ${color.value}`}></div>
                                    </RadioGroupItem>
                                </div>
                            ))}
                            </RadioGroup>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>Asignar a</Label>
                            <RadioGroup 
                                value={clockInTypeFormData.assignment} 
                                onValueChange={(value: 'all' | 'specific') => setClockInTypeFormData({...clockInTypeFormData, assignment: value})} 
                                className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="r-all"/>
                                    <Label htmlFor="r-all">Toda la empresa</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="specific" id="r-specific"/>
                                    <Label htmlFor="r-specific">Empleados específicos</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {clockInTypeFormData.assignment === 'specific' && (
                            <div className="space-y-2">
                                <Label>Empleados</Label>
                                <ScrollArea className="h-40 rounded-md border p-4">
                                    <div className="space-y-2">
                                        {employees.map(employee => (
                                            <div key={employee.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`emp-${employee.id}`}
                                                    checked={clockInTypeFormData.assignedTo.includes(employee.name)}
                                                    onCheckedChange={(checked) => {
                                                        const newAssignedTo = checked 
                                                            ? [...clockInTypeFormData.assignedTo, employee.name]
                                                            : clockInTypeFormData.assignedTo.filter(name => name !== employee.name);
                                                        setClockInTypeFormData({...clockInTypeFormData, assignedTo: newAssignedTo});
                                                    }}
                                                />
                                                <Label htmlFor={`emp-${employee.id}`} className="font-normal">{employee.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                      <Button type="submit">{dialogClockInTypeMode === 'add' ? 'Añadir' : 'Guardar'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {clockInTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                   <div>
                        <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded-full ${type.color}`}></div>
                            <h3 className="font-semibold">{type.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">
                            {type.assignment === 'all' 
                                ? 'Asignado a: Toda la empresa' 
                                : `Asignado a: ${type.assignedTo.length} empleado(s)`}
                        </p>
                    </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => openEditClockInTypeDialog(type)}>Editar</Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClockInType(type.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacations" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Configuración de Vacaciones</CardTitle>
                    <CardDescription>Establece las políticas de vacaciones para la empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="default-vacation-days">Días de vacaciones por defecto al año</Label>
                        <Input id="default-vacation-days" type="number" defaultValue="22" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="block-periods" />
                        <Label htmlFor="block-periods">Bloquear periodos específicos para solicitudes de vacaciones</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="natural-days" />
                        <Label htmlFor="natural-days">Contar vacaciones como días naturales en lugar de laborables</Label>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="absences" className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Tipos de Ausencia</CardTitle>
                        <CardDescription>Crea y configura diferentes tipos de permisos y ausencias.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {absenceTypes.map((absence, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h3 className="font-semibold">{absence.name}</h3>
                                <p className="text-sm text-muted-foreground">Remunerado: {absence.remunerated ? 'Sí' : 'No'} | Límite: {absence.limit}</p>
                            </div>
                            <Button variant="ghost">Editar</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="automations" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Automatizaciones de Jornada</CardTitle>
                    <CardDescription>Configura acciones automáticas para los fichajes de los empleados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-semibold">Cierre Automático al Cumplir Horario</h3>
                            <p className="text-sm text-muted-foreground">Cierra el fichaje cuando el empleado completa su jornada.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-semibold">Cierre Automático por Olvido</h3>
                            <p className="text-sm text-muted-foreground">Establece una hora tope para cerrar fichajes abiertos.</p>
                        </div>
                         <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Permisos de Empleado</CardTitle>
                    <CardDescription>Restringe la visibilidad de ciertas secciones para los empleados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <h3 className="font-semibold">Ver "Husin" y "Timeline"</h3>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <h3 className="font-semibold">Ver calendario de ausencias del equipo</h3>
                        <Switch defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <h3 className="font-semibold">Editar su propio perfil</h3>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Autenticación</CardTitle>
              <CardDescription>Gestiona la configuración de seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta.</p>
                </div>
                <Switch aria-label="Toggle Two-Factor Authentication" />
              </div>
              <Button>Cambiar Contraseña Maestra</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Integraciones de Aplicaciones</CardTitle>
              <CardDescription>Conecta WorkFlow Central con tus herramientas favoritas.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Slack</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground mb-4">Recibe notificaciones en Slack.</p><Button className="w-full">Conectar</Button></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Google Calendar</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground mb-4">Sincroniza ausencias y horarios.</p><Button className="w-full">Conectar</Button></CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle className="text-lg">QuickBooks</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground mb-4">Sincroniza datos de nómina.</p><Button className="w-full" variant="secondary" disabled>Conectado</Button></CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Preferencias de Notificaciones</CardTitle>
              <CardDescription>Gestiona cómo recibes las notificaciones como administrador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Nuevas Solicitudes de Ausencia</h3>
                  <p className="text-sm text-muted-foreground">Notificar por email cuando un empleado solicite tiempo libre.</p>
                </div>
                <Switch defaultChecked aria-label="Toggle absence request notifications" />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Alertas de Finalización de Proyecto</h3>
                  <p className="text-sm text-muted-foreground">Recibir un email cuando un proyecto se marque como completado.</p>
                </div>
                <Switch defaultChecked aria-label="Toggle project completion notifications" />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Resumen Semanal de Actividad</h3>
                   <p className="text-sm text-muted-foreground">Enviar un resumen de la actividad del equipo cada lunes.</p>
                </div>
                <Switch aria-label="Toggle weekly summary notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
