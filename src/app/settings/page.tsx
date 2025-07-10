
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CalendarClock, Briefcase, UserPlus, SlidersHorizontal, Sun, Moon, Coffee, Timer, CalendarDays, Plane, Bell, Bot, Lock, Puzzle, List, PlusCircle, Trash2, ArrowLeft, Calendar as CalendarIcon, Terminal, Globe, CircleDot, Gift, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DateRange } from "react-day-picker";
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { type Employee, type Center, type Department, type Role, type Break, type ClockInType, type Shift, type FlexibleSchedule, type FixedSchedule, type AbsenceType, type Holiday, type CalendarData, type VacationPolicy, type Incentive, listIncentives, createIncentive, listSettings, createSetting, updateSetting, deleteSetting, listEmployees } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";


const allPermissions = [
    { id: 'view_dashboard', label: 'Ver Panel Principal' },
    { id: 'manage_employees', label: 'Gestionar Empleados (Ver, Crear, Editar)' },
    { id: 'manage_attendance', label: 'Gestionar Asistencia y Fichajes' },
    { id: 'manage_absences', label: 'Gestionar Ausencias y Aprobaciones' },
    { id: 'manage_projects', label: 'Gestionar Proyectos y Objetivos' },
    { id: 'manage_performance', label: 'Gestionar Evaluaciones de Desempeño' },
    { id: 'manage_documents', label: 'Gestionar Documentos de la Empresa' },
    { id: 'manage_reports', label: 'Generar Informes de Empresa' },
    { id: 'manage_settings', label: 'Gestionar Configuración de la Empresa' },
    { id: 'manage_roles', label: 'Gestionar Roles y Permisos' },
];

const defaultMapCenter = { lat: 40.416775, lng: -3.703790 };

const projectColors = [
    { value: 'bg-blue-500', label: 'Azul' },
    { value: 'bg-purple-500', label: 'Morado' },
    { value: 'bg-green-500', label: 'Verde' },
    { value: 'bg-orange-500', label: 'Naranja' },
    { value: 'bg-red-500', label: 'Rojo' },
    { value: 'bg-gray-500', label: 'Gris' },
];

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const containerStyle = {
    width: '100%',
    height: '256px',
    borderRadius: '0.375rem',
    overflow: 'hidden'
};

const CenterDialogContent = ({
    mode,
    center,
    onSubmit,
    onClose,
}: {
    mode: 'add' | 'edit';
    center: Center | null;
    onSubmit: (data: Center) => void;
    onClose: () => void;
}) => {
    const [centerData, setCenterData] = useState<Center | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";

    useEffect(() => {
        if (mode === 'edit' && center) {
            setCenterData(center);
        } else {
            setCenterData({ id: uuidv4(), name: '', address: '', radius: 100, lat: defaultMapCenter.lat, lng: defaultMapCenter.lng, timezone: 'Europe/Madrid' });
        }
    }, [mode, center]);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const autocomplete = new places.Autocomplete(inputRef.current, {
            fields: ["geometry.location", "formatted_address", "name"],
        });

        const listener = autocomplete.addListener('place_changed', async () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location) {
                console.error("Place has no geometry");
                return;
            }

            const address = place.formatted_address || place.name || '';
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            const prevData = centerData || { id: '', name: '', radius: 100 };
            const updatedData = { ...prevData, address, lat, lng, timezone: 'Cargando...' };
            setCenterData(updatedData);

            try {
                const timestamp = Math.floor(Date.now() / 1000);
                const response = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`);
                const data = await response.json();
                if (data.status === 'OK') {
                    setCenterData(prev => ({...prev!, timezone: data.timeZoneId }));
                } else {
                    setCenterData(prev => ({...prev!, timezone: 'No disponible' }));
                }
            } catch (error) {
                console.error("Failed to fetch timezone", error);
                setCenterData(prev => ({...prev!, timezone: 'Error al cargar' }));
            }
        });

        return () => {
            listener.remove();
            const pacContainers = document.querySelectorAll('.pac-container');
            pacContainers.forEach(container => container.remove());
        };
    }, [places, apiKey, centerData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (centerData) {
            onSubmit(centerData);
        }
    };

    if (!centerData) return null;

    return (
        <DialogContent onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.pac-container')) {
                e.preventDefault();
            }
        }}>
            <DialogHeader><DialogTitle>{mode === 'add' ? 'Nuevo Centro de Trabajo' : 'Editar Centro de Trabajo'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="center-name">Nombre del Centro</Label>
                        <Input
                            id="center-name"
                            value={centerData.name}
                            onChange={(e) => setCenterData(prev => ({...prev!, name: e.target.value}))}
                            placeholder="Ej. Oficina Principal"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="center-address">Dirección</Label>
                        <Input
                            ref={inputRef}
                            id="center-address"
                            value={centerData.address}
                            onChange={(e) => setCenterData(prev => ({...prev!, address: e.target.value}))}
                            placeholder={places ? "Buscar dirección..." : "Cargando mapa..."}
                            disabled={!places}
                            required
                        />
                    </div>
                    
                    <div style={containerStyle}>
                        <Map
                            center={{ lat: centerData.lat, lng: centerData.lng }}
                            zoom={15}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            mapId="workflow-map-dialog"
                        >
                            <AdvancedMarker position={{ lat: centerData.lat, lng: centerData.lng }} />
                        </Map>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="center-radius">Radio de Geolocalización (metros)</Label>
                        <Input
                            id="center-radius"
                            type="number"
                            value={centerData.radius}
                            onChange={(e) => setCenterData(prev => ({ ...prev!, radius: parseInt(e.target.value) || 0 }))}
                            placeholder="Ej. 100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="center-timezone">Zona Horaria</Label>
                        <Input id="center-timezone" value={centerData.timezone} readOnly />
                    </div>
                </div>
                <DialogFooter><Button type="submit">Guardar Centro</Button></DialogFooter>
            </form>
        </DialogContent>
    );
};

const CenterDialog = ({
    isOpen,
    onOpenChange,
    ...props
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    mode: 'add' | 'edit';
    center: Center | null;
    onSubmit: (data: Center) => void;
}) => {
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {isOpen && (
                <APIProvider apiKey={apiKey}>
                    <CenterDialogContent onClose={() => onOpenChange(false)} {...props} />
                </APIProvider>
            )}
        </Dialog>
    );
};


const CentersTabContent = () => {
    const { toast } = useToast();
    const [centers, setCenters] = useState<Center[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
    const [dialogCenterMode, setDialogCenterMode] = useState<'add' | 'edit'>('add');
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
    const [dialogDeptMode, setDialogDeptMode] = useState<'add' | 'edit'>('add');
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [newDepartmentName, setNewDepartmentName] = useState("");

    const [authError, setAuthError] = useState(false);
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";

    const fetchData = async () => {
        setIsLoading(false); // Using mock data
    };
    
    useEffect(() => {
        fetchData();
        const handleAuthError = () => setAuthError(true);
        window.addEventListener('gm_authFailure', handleAuthError);
        return () => window.removeEventListener('gm_authFailure', handleAuthError);
    }, [toast]);

    const openAddCenterDialog = () => {
        setDialogCenterMode('add');
        setSelectedCenter(null);
        setIsCenterDialogOpen(true);
    };

    const openEditCenterDialog = (center: Center) => {
        setDialogCenterMode('edit');
        setSelectedCenter(center);
        setIsCenterDialogOpen(true);
    };

    const handleCenterFormSubmit = (centerData: Center) => {
        if (dialogCenterMode === 'add') {
            setCenters(prev => [...prev, centerData]);
        } else if (dialogCenterMode === 'edit' && selectedCenter) {
            setCenters(prev => prev.map(c => (c.id === selectedCenter.id ? centerData : c)));
        }
        setIsCenterDialogOpen(false);
    };

    const handleDeleteCenter = (centerId: string) => {
        setCenters(prev => prev.filter(c => c.id !== centerId));
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
            setDepartments(prev => [...prev, { id: uuidv4(), name: newDepartmentName }]);
        } else if (dialogDeptMode === 'edit' && selectedDepartment) {
            setDepartments(prev => prev.map(d => (d.id === selectedDepartment.id ? { ...d, name: newDepartmentName } : d)));
        }

        setNewDepartmentName("");
        setIsDeptDialogOpen(false);
    };
    
    const handleDeleteDepartment = (departmentId: string) => {
        setDepartments(prev => prev.filter(d => d.id !== departmentId));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            {authError && apiKey && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error de Autenticación de Google Maps</AlertTitle>
                    <AlertDescription>
                        Tu clave de API ha sido rechazada. Por favor, asegúrate de que esté configurada correctamente para tu proyecto en Google Cloud Console.
                    </AlertDescription>
                </Alert>
            )}
            <Card className="bg-gradient-accent-to-card">
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Centros de Trabajo</CardTitle>
                    <CardDescription>Configura las ubicaciones de tu empresa para fichajes con geolocalización.</CardDescription>
                </div>
                <Button onClick={openAddCenterDialog} disabled={authError}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Centro</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                {centers.map((center) => (
                    <div key={center.id} className="flex items-center justify-between rounded-xl border p-4">
                        <div>
                            <h3 className="font-semibold">{center.name}</h3>
                            <p className="text-sm text-muted-foreground">{center.address}</p>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Globe className="h-3 w-3" /> <span>{center.timezone}</span>
                                <span className="text-muted-foreground/50">|</span>
                                <CircleDot className="h-3 w-3" /> <span>Radio: {center.radius}m</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Button variant="ghost" size="sm" onClick={() => openEditCenterDialog(center)} disabled={authError}>Editar</Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCenter(center.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                </CardContent>
            </Card>
            <CenterDialog 
                isOpen={isCenterDialogOpen}
                onOpenChange={setIsCenterDialogOpen}
                mode={dialogCenterMode}
                center={selectedCenter}
                onSubmit={handleCenterFormSubmit}
            />
            <Card className="bg-gradient-accent-to-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Departamentos</CardTitle>
                        <CardDescription>Organiza a tus empleados en diferentes departamentos.</CardDescription>
                    </div>
                    <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                        <DialogTrigger asChild><Button onClick={openAddDeptDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Depto.</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-xs">
                            <DialogHeader><DialogTitle>{dialogDeptMode === 'add' ? 'Nuevo Departamento' : 'Editar Departamento'}</DialogTitle></DialogHeader>
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
                    {departments.map((dept) => (
                        <div key={dept.id} className="flex items-center justify-between rounded-xl border p-4">
                            <h3 className="font-semibold">{dept.name}</h3>
                            <div className="flex items-center">
                                <Button variant="ghost" size="sm" onClick={() => openEditDeptDialog(dept)}>Editar</Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDepartment(dept.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const SettingsTabs = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [breaks, setBreaks] = useState<Break[]>([]);
    const [clockInTypes, setClockInTypes] = useState<ClockInType[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [flexibleSchedules, setFlexibleSchedules] = useState<FlexibleSchedule[]>([]);
    const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [calendars, setCalendars] = useState<CalendarData[]>([]);
    const [vacationPolicies, setVacationPolicies] = useState<VacationPolicy[]>([]);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    
    // Dialog states
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [dialogRoleMode, setDialogRoleMode] = useState<'add' | 'edit'>('add');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleFormData, setRoleFormData] = useState<Partial<Role>>({ name: '', description: '', permissions: [] });
    const [isDeleteRoleAlertOpen, setIsDeleteRoleAlertOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    
    const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
    const [dialogBreakMode, setDialogBreakMode] = useState<'add' | 'edit'>('add');
    const [selectedBreak, setSelectedBreak] = useState<Break | null>(null);
    const [breakFormData, setBreakFormData] = useState<Break>({ id: '', name: "", remunerated: false, limit: 30, isAutomatic: false, intervalStart: "", intervalEnd: "", notifyStart: false, notifyEnd: false, assignedTo: [] });
    
    const [isClockInTypeDialogOpen, setIsClockInTypeDialogOpen] = useState(false);
    const [dialogClockInTypeMode, setDialogClockInTypeMode] = useState<'add' | 'edit'>('add');
    const [selectedClockInType, setSelectedClockInType] = useState<ClockInType | null>(null);
    const [clockInTypeFormData, setClockInTypeFormData] = useState<ClockInType>({ id: '', name: "", color: "bg-blue-500", assignment: 'all', assignedTo: [] });
    
    const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
    const [dialogShiftMode, setDialogShiftMode] = useState<'add' | 'edit'>('add');
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [shiftFormData, setShiftFormData] = useState<Omit<Shift, 'id'>>({ name: "09:00", start: "09:00", end: "17:00" });

    const [isFlexibleScheduleDialogOpen, setIsFlexibleScheduleDialogOpen] = useState(false);
    const [dialogFlexibleScheduleMode, setDialogFlexibleScheduleMode] = useState<'add' | 'edit'>('add');
    const [selectedFlexibleSchedule, setSelectedFlexibleSchedule] = useState<FlexibleSchedule | null>(null);
    const [flexibleScheduleFormData, setFlexibleScheduleFormData] = useState<Omit<FlexibleSchedule, 'id'>>({ name: "", workDays: [], hoursPerDay: 8, noWeeklyHours: false });
    
    const [isFixedScheduleDialogOpen, setIsFixedScheduleDialogOpen] = useState(false);
    const [dialogFixedScheduleMode, setDialogFixedScheduleMode] = useState<'add' | 'edit'>('add');
    const [selectedFixedSchedule, setSelectedFixedSchedule] = useState<FixedSchedule | null>(null);
    const [fixedScheduleFormData, setFixedScheduleFormData] = useState<Omit<FixedSchedule, 'id'>>({ name: "", workDays: [], ranges: [{ id: Date.now().toString(), start: "09:00", end: "17:00" }], isNightShift: false });
    
    const [isAbsenceTypeDialogOpen, setIsAbsenceTypeDialogOpen] = useState(false);
    const [dialogAbsenceTypeMode, setDialogAbsenceTypeMode] = useState<'add' | 'edit'>('add');
    const [selectedAbsenceType, setSelectedAbsenceType] = useState<AbsenceType | null>(null);
    const [absenceTypeFormData, setAbsenceTypeFormData] = useState<Omit<AbsenceType, 'id' | 'blockedPeriods'> & { blockedPeriods?: { id: string, from: string, to: string }[] }>({ name: '', color: 'bg-blue-500', remunerated: true, unit: 'days', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], requiresApproval: true, allowAttachment: false, isDisabled: false, assignment: 'all', assignedTo: [] });
    const [newAbsenceBlockedPeriod, setNewAbsenceBlockedPeriod] = useState<DateRange | undefined>(undefined);


    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
    const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
    const [newCalendarName, setNewCalendarName] = useState("");
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
    const [holidayFormData, setHolidayFormData] = useState<{name: string, date: Date | undefined}>({ name: "", date: undefined });
    
    const [isVacationPolicyDialogOpen, setIsVacationPolicyDialogOpen] = useState(false);
    const [dialogVacationPolicyMode, setDialogVacationPolicyMode] = useState<'add' | 'edit'>('add');
    const [selectedVacationPolicy, setSelectedVacationPolicy] = useState<VacationPolicy | null>(null);
    const [vacationPolicyFormData, setVacationPolicyFormData] = useState<Omit<VacationPolicy, 'id'>>({ name: '', unit: 'days', amount: 22, countBy: 'workdays', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], assignment: 'all', assignedTo: [] });
    const [newBlockedPeriod, setNewBlockedPeriod] = useState<DateRange | undefined>(undefined);
    
    const [isIncentiveDialogOpen, setIsIncentiveDialogOpen] = useState(false);
    const [dialogIncentiveMode, setDialogIncentiveMode] = useState<'add' | 'edit'>('add');
    const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(null);
    const [incentiveFormData, setIncentiveFormData] = useState<Omit<Incentive, 'id' | 'company_id'>>({ name: "", type: "económico", value: "", period: "anual", active: true, condition_expression: { modality: 'all-or-nothing' }});
    
    // Role Handlers
    const openAddRoleDialog = () => { setIsRoleDialogOpen(true); setDialogRoleMode('add'); setSelectedRole(null); setRoleFormData({ name: '', description: '', permissions: [] }); };
    const openEditRoleDialog = (role: Role) => { setIsRoleDialogOpen(true); setDialogRoleMode('edit'); setSelectedRole(role); setRoleFormData(role); };
    
    const handleRoleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Mock functionality
      if (dialogRoleMode === 'add') {
          const newRole = { id: uuidv4(), ...roleFormData } as Role;
          setRoles(prev => [...prev, newRole]);
      } else if (selectedRole) {
          const updatedRole = { ...selectedRole, ...roleFormData };
          setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
      }
      setIsRoleDialogOpen(false);
    };

    const confirmDeleteRole = (role: Role) => {
        setRoleToDelete(role);
        setIsDeleteRoleAlertOpen(true);
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete?.id) return;
        setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        setIsDeleteRoleAlertOpen(false);
        setRoleToDelete(null);
    };
    
    // Break Handlers
    const openAddBreakDialog = () => { setIsBreakDialogOpen(true); setDialogBreakMode('add'); setBreakFormData({ id: uuidv4(), name: "", remunerated: false, limit: 30, isAutomatic: false, intervalStart: "", intervalEnd: "", notifyStart: false, notifyEnd: false, assignedTo: [] }); };
    const openEditBreakDialog = (br: Break) => { setIsBreakDialogOpen(true); setDialogBreakMode('edit'); setSelectedBreak(br); setBreakFormData(br); };
    const handleBreakFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsBreakDialogOpen(false); };
    const handleDeleteBreak = (breakId: string) => { setBreaks(p => p.filter(b => b.id !== breakId)); };

    // ClockIn Type Handlers
    const openAddClockInTypeDialog = () => { setIsClockInTypeDialogOpen(true); setDialogClockInTypeMode('add'); setClockInTypeFormData({ id: uuidv4(), name: "", color: "bg-blue-500", assignment: 'all', assignedTo: [] }); };
    const openEditClockInTypeDialog = (type: ClockInType) => { setIsClockInTypeDialogOpen(true); setDialogClockInTypeMode('edit'); setSelectedClockInType(type); setClockInTypeFormData(type); };
    const handleClockInTypeFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsClockInTypeDialogOpen(false); };
    const handleDeleteClockInType = (typeId: string) => { setClockInTypes(p => p.filter(t => t.id !== typeId)); };
    
    // Schedule & Shift Handlers
    const openAddShiftDialog = () => { setIsShiftDialogOpen(true); setDialogShiftMode('add'); setShiftFormData({ name: "09:00", start: "09:00", end: "17:00" }); };
    const openEditShiftDialog = (shift: Shift) => { setIsShiftDialogOpen(true); setDialogShiftMode('edit'); setSelectedShift(shift); setShiftFormData(shift); };
    const handleShiftFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsShiftDialogOpen(false); };
    const handleDeleteShift = (shiftId: string) => { setShifts(p => p.filter(s => s.id !== shiftId)); };

    const openAddFlexibleScheduleDialog = () => { setIsFlexibleScheduleDialogOpen(true); setDialogFlexibleScheduleMode('add'); setFlexibleScheduleFormData({ name: "", workDays: [], hoursPerDay: 8, noWeeklyHours: false }); };
    const openEditFlexibleScheduleDialog = (schedule: FlexibleSchedule) => { setIsFlexibleScheduleDialogOpen(true); setDialogFlexibleScheduleMode('edit'); setSelectedFlexibleSchedule(schedule); setFlexibleScheduleFormData(schedule); };
    const handleFlexibleScheduleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsFlexibleScheduleDialogOpen(false); };
    const handleDeleteFlexibleSchedule = (scheduleId: string) => { setFlexibleSchedules(p => p.filter(s => s.id !== scheduleId)); };
    
    const openAddFixedScheduleDialog = () => { setIsFixedScheduleDialogOpen(true); setDialogFixedScheduleMode('add'); setFixedScheduleFormData({ name: "", workDays: [], ranges: [{ id: Date.now().toString(), start: "09:00", end: "17:00" }], isNightShift: false }); };
    const openEditFixedScheduleDialog = (schedule: FixedSchedule) => { setIsFixedScheduleDialogOpen(true); setDialogFixedScheduleMode('edit'); setSelectedFixedSchedule(schedule); setFixedScheduleFormData(schedule); };
    const handleFixedScheduleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsFixedScheduleDialogOpen(false); };
    const handleDeleteFixedSchedule = (scheduleId: string) => { setFixedSchedules(p => p.filter(s => s.id !== scheduleId)); };

    // Calendar & Holiday Handlers
    const handleSelectCalendar = (id: string) => setSelectedCalendarId(id);
    const handleBackToCalendars = () => setSelectedCalendarId(null);
    const handleCalendarFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsCalendarDialogOpen(false); };
    const handleDeleteCalendar = (id: string) => { setCalendars(p => p.filter(c => c.id !== id)); };
    const handleHolidayFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsHolidayDialogOpen(false); };
    const handleDeleteHoliday = (holidayId: string) => { /* TODO: Mock */ };
    const handleImportHolidays = () => { /* TODO: Mock */ };
    
    // Absence Type Handlers
    const openAddAbsenceTypeDialog = () => { setIsAbsenceTypeDialogOpen(true); setDialogAbsenceTypeMode('add'); setAbsenceTypeFormData({ name: '', color: 'bg-blue-500', remunerated: true, unit: 'days', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], requiresApproval: true, allowAttachment: false, isDisabled: false, assignment: 'all', assignedTo: [] }); };
    const openEditAbsenceTypeDialog = (type: AbsenceType) => { setIsAbsenceTypeDialogOpen(true); setDialogAbsenceTypeMode('edit'); setSelectedAbsenceType(type); setAbsenceTypeFormData({ ...type, blockedPeriods: type.blockedPeriods ?? [] }); };
    const handleAbsenceTypeFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsAbsenceTypeDialogOpen(false); };
    const handleDeleteAbsenceType = (id: string) => { setAbsenceTypes(p => p.filter(t => t.id !== id)); };

    // Vacation Policy Handlers
    const openAddVacationPolicyDialog = () => { setIsVacationPolicyDialogOpen(true); setDialogVacationPolicyMode('add'); setVacationPolicyFormData({ name: '', unit: 'days', amount: 22, countBy: 'workdays', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], assignment: 'all', assignedTo: [] }); };
    const openEditVacationPolicyDialog = (policy: VacationPolicy) => { setIsVacationPolicyDialogOpen(true); setDialogVacationPolicyMode('edit'); setSelectedVacationPolicy(policy); setVacationPolicyFormData({ ...policy, requestLimit: policy.requestLimit || 0, blockedPeriods: policy.blockedPeriods || [], assignment: policy.assignment || 'all', assignedTo: policy.assignedTo || [] }); };
    const handleVacationPolicyFormSubmit = (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsVacationPolicyDialogOpen(false); };
    const handleDeleteVacationPolicy = (id: string) => { setVacationPolicies(p => p.filter(pol => pol.id !== id)); };

    // Incentive Handlers
    const openAddIncentiveDialog = () => { setIsIncentiveDialogOpen(true); setDialogIncentiveMode('add'); setIncentiveFormData({ name: "", type: "económico", value: "", period: "anual", active: true, condition_expression: { modality: 'all-or-nothing' } }); };
    const openEditIncentiveDialog = (incentive: Incentive) => { setIsIncentiveDialogOpen(true); setDialogIncentiveMode('edit'); setSelectedIncentive(incentive); setIncentiveFormData({ ...incentive, condition_expression: incentive.condition_expression || { modality: 'all-or-nothing' } }); };
    const handleIncentiveFormSubmit = async (e: React.FormEvent) => { e.preventDefault(); /* TODO: Mock */ setIsIncentiveDialogOpen(false); };
    const handleDeleteIncentive = (id: string) => { setIncentives(p => p.filter(i => i.id !== id)); };
    
    const selectedCalendar = calendars.find(c => c.id === selectedCalendarId);
    const holidayDates = selectedCalendar?.holidays.map(h => new Date(h.date)) || [];

    return (
        <Tabs defaultValue="general" className="space-y-4 md:flex md:space-y-0 md:space-x-4">
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
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">COMPENSACIÓN</p>
                <TabsTrigger value="incentives" className="w-full justify-start"><Gift className="mr-2 h-4 w-4"/>Incentivos</TabsTrigger>
                <Separator className="my-2"/>
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">CUENTA</p>
                <TabsTrigger value="automations" className="w-full justify-start"><Bot className="mr-2 h-4 w-4"/>Automatizaciones</TabsTrigger>
                <TabsTrigger value="notifications" className="w-full justify-start"><Bell className="mr-2 h-4 w-4"/>Notificaciones</TabsTrigger>
                <TabsTrigger value="permissions" className="w-full justify-start"><Lock className="mr-2 h-4 w-4"/>Permisos</TabsTrigger>
                <TabsTrigger value="integrations" className="w-full justify-start"><Puzzle className="mr-2 h-4 w-4"/>Integraciones</TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start"><Lock className="mr-2 h-4 w-4"/>Seguridad</TabsTrigger>
            </TabsList>
            
            <div className="flex-1">
                <TabsContent value="general" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Detalles de la Empresa</CardTitle>
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

                <TabsContent value="roles" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Roles de Usuario</CardTitle>
                                <CardDescription>Indica qué usuarios tendrán más visibilidad o control.</CardDescription>
                            </div>
                            <Button onClick={openAddRoleDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Rol</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading['roles'] ? <Loader2 className="animate-spin" /> : roles.map((role) => (
                                <div key={role.id} className="flex items-center justify-between rounded-xl border p-4">
                                    <div>
                                        <h3 className="font-semibold">{role.name}</h3>
                                        <p className="text-sm text-muted-foreground">{role.description}</p>
                                    </div>
                                    <div className="flex items-center">
                                      <Button variant="ghost" size="sm" onClick={() => openEditRoleDialog(role)}>Editar</Button>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => confirmDeleteRole(role)}>
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>
                                    {dialogRoleMode === 'add' ? 'Añadir Nuevo Rol' : 'Editar Rol'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleRoleFormSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role-name">Nombre del Rol</Label>
                                        <Input id="role-name" value={roleFormData.name} onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role-description">Descripción</Label>
                                        <Textarea id="role-description" value={roleFormData.description} onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Permisos</Label>
                                        <ScrollArea className="h-48 rounded-md border p-4">
                                            <div className="space-y-3">
                                                {allPermissions.map((permission) => (
                                                    <div key={permission.id} className="flex items-start space-x-2">
                                                        <Checkbox
                                                            id={`perm-${permission.id}`}
                                                            checked={(roleFormData.permissions || []).includes(permission.id)}
                                                            onCheckedChange={(checked) => {
                                                                const currentPermissions = roleFormData.permissions || [];
                                                                setRoleFormData(prev => ({
                                                                    ...prev,
                                                                    permissions: checked
                                                                        ? [...currentPermissions, permission.id]
                                                                        : currentPermissions.filter(p => p !== permission.id)
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
                    <AlertDialog open={isDeleteRoleAlertOpen} onOpenChange={setIsDeleteRoleAlertOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el rol "{roleToDelete?.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRoleToDelete(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteRole} className={cn(buttonVariants({ variant: "destructive" }))}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TabsContent>
                
                <TabsContent value="centers" className="space-y-4 m-0">
                    <CentersTabContent />
                </TabsContent>
                
                <TabsContent value="breaks" className="m-0">
                     <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Descansos</CardTitle>
                                <CardDescription>Define las pausas que tus empleados pueden tomar.</CardDescription>
                            </div>
                            <Button onClick={openAddBreakDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Descanso</Button>
                        </CardHeader>
                         <CardContent>
                             {isLoading['breaks'] ? <Loader2 className="animate-spin" /> : <Table>
                                 <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Tipo</TableHead><TableHead>Duración</TableHead><TableHead>Asignación</TableHead><TableHead><span className="sr-only">Acciones</span></TableHead></TableRow></TableHeader>
                                 <TableBody>
                                     {breaks.map(br => (
                                         <TableRow key={br.id}>
                                             <TableCell className="font-medium">{br.name}</TableCell>
                                             <TableCell>{br.remunerated ? 'Remunerado' : 'No Remunerado'}</TableCell>
                                             <TableCell>{br.limit} min</TableCell>
                                             <TableCell>
                                                 {br.assignedTo.length > 2 ? `${br.assignedTo.slice(0, 2).join(', ')}...` : br.assignedTo.join(', ')}
                                             </TableCell>
                                             <TableCell className="text-right">
                                                 <Button variant="ghost" size="sm" onClick={() => openEditBreakDialog(br)}>Editar</Button>
                                                 <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBreak(br.id)}>
                                                     <Trash2 className="h-4 w-4" />
                                                 </Button>
                                             </TableCell>
                                         </TableRow>
                                     ))}
                                     {breaks.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No hay descansos definidos.</TableCell></TableRow>}
                                 </TableBody>
                             </Table>}
                         </CardContent>
                     </Card>
                     <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
                         <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {dialogBreakMode === 'add' ? 'Nuevo Descanso' : 'Editar Descanso'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleBreakFormSubmit}>
                                {/* Form fields for Breaks */}
                            </form>
                         </DialogContent>
                     </Dialog>
                </TabsContent>

                <TabsContent value="incentives" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gestión de Incentivos</CardTitle>
                                <CardDescription>Crea y gestiona los planes de incentivos de tu empresa.</CardDescription>
                            </div>
                             <Button onClick={openAddIncentiveDialog}><PlusCircle className="mr-2 h-4 w-4"/> Crear Incentivo</Button>
                        </CardHeader>
                        <CardContent>
                             {isLoading['incentives'] ? <Loader2 className="animate-spin" /> : <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Modalidad</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incentives.map(incentive => (
                                        <TableRow key={incentive.id}>
                                            <TableCell className="font-medium">{incentive.name}</TableCell>
                                            <TableCell className="capitalize">{incentive.type}</TableCell>
                                            <TableCell>{incentive.value}</TableCell>
                                            <TableCell className="capitalize">
                                                {incentive.condition_expression?.modality === 'proportional' ? 'Proporcional' : 'Todo o Nada'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={incentive.active ? "active" : "secondary"}>
                                                    {incentive.active ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openEditIncentiveDialog(incentive)}>Editar</Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteIncentive(incentive.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {incentives.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">No se han creado incentivos.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>}
                        </CardContent>
                    </Card>
                    <Dialog open={isIncentiveDialogOpen} onOpenChange={setIsIncentiveDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{dialogIncentiveMode === 'add' ? 'Crear Nuevo Incentivo' : 'Editar Incentivo'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleIncentiveFormSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="incentive-name">Nombre del Incentivo</Label>
                                    <Input id="incentive-name" value={incentiveFormData.name} onChange={e => setIncentiveFormData({...incentiveFormData, name: e.target.value})} required/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="incentive-type">Tipo</Label>
                                        <Select value={incentiveFormData.type} onValueChange={(value: Incentive['type']) => setIncentiveFormData({...incentiveFormData, type: value})}>
                                            <SelectTrigger id="incentive-type"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="económico">Económico</SelectItem>
                                                <SelectItem value="días_libres">Días libres</SelectItem>
                                                <SelectItem value="formación">Formación</SelectItem>
                                                <SelectItem value="otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="incentive-value">Valor</Label>
                                        <Input id="incentive-value" value={incentiveFormData.value} onChange={e => setIncentiveFormData({...incentiveFormData, value: e.target.value})} placeholder="Ej. 500€ o 2 días" required/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="incentive-period">Periodo</Label>
                                        <Select value={incentiveFormData.period} onValueChange={(value: Incentive['period']) => setIncentiveFormData({...incentiveFormData, period: value})}>
                                            <SelectTrigger id="incentive-period"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mensual">Mensual</SelectItem>
                                                <SelectItem value="trimestral">Trimestral</SelectItem>
                                                <SelectItem value="anual">Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch id="incentive-active" checked={incentiveFormData.active} onCheckedChange={(checked) => setIncentiveFormData({...incentiveFormData, active: checked})} />
                                            <Label htmlFor="incentive-active">Activo</Label>
                                        </div>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Modalidad del Incentivo</Label>
                                    <RadioGroup 
                                        value={incentiveFormData.condition_expression?.modality || 'all-or-nothing'} 
                                        onValueChange={(value: 'proportional' | 'all-or-nothing') => setIncentiveFormData(prev => ({...prev, condition_expression: {...prev.condition_expression, modality: value}}))} 
                                        className="flex gap-4 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all-or-nothing" id="modality-all"/>
                                            <Label htmlFor="modality-all" className="font-normal">Todo o Nada</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="proportional" id="modality-prop"/>
                                            <Label htmlFor="modality-prop" className="font-normal">Proporcional</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </div>
        </Tabs>
    );
};


export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Gestiona la configuración de la cuenta y de la organización.</p>
            </div>
            <SettingsTabs />
        </div>
    )
}

    