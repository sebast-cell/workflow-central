
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CalendarClock, Briefcase, UserPlus, SlidersHorizontal, Sun, Moon, Coffee, Timer, CalendarDays, Plane, Bell, Bot, Lock, Puzzle, List, PlusCircle, Trash2, ArrowLeft, Calendar as CalendarIcon, Terminal, Globe, CircleDot, Gift } from "lucide-react";
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
import { type Employee, type Center, type Department, type Role, type Break, type ClockInType, type Shift, type FlexibleSchedule, type FixedSchedule, type AbsenceType, type Holiday, type CalendarData, type VacationPolicy, type Incentive, listIncentives, createIncentive } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';


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

const initialEmployees: Employee[] = [];

const defaultMapCenter = { lat: 40.416775, lng: -3.703790 };

const initialCenters: Center[] = [
    { name: "Oficina Central", address: "123 Calle Principal, Anytown", radius: 100, lat: defaultMapCenter.lat, lng: defaultMapCenter.lng, timezone: 'Europe/Madrid' },
    { name: "Almacén Norte", address: "456 Avenida Industrial, Anytown", radius: 150, lat: defaultMapCenter.lat + 0.01, lng: defaultMapCenter.lng + 0.01, timezone: 'Europe/Madrid' },
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
    { name: "Recursos Humanos", description: "Gestiona personal, but no la configuración.", permissions: ['view_dashboard', 'manage_employees', 'manage_attendance', 'manage_absences', 'manage_performance', 'manage_documents'] },
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
const initialShifts: Shift[] = [
    { id: "1", name: "Turno de Mañana", start: "06:00", end: "14:00" },
    { id: "2", name: "Turno de Tarde", start: "14:00", end: "22:00" },
    { id: "3", name: "Turno de Noche", start: "22:00", end: "06:00" },
];
const initialAbsenceTypes: AbsenceType[] = [
    { id: 'telework', name: "Teletrabajo", color: "bg-blue-500", remunerated: true, unit: 'days', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], requiresApproval: true, allowAttachment: false, isDisabled: false, assignment: 'all', assignedTo: [] },
];
const initialCalendars: CalendarData[] = [
    { id: 'default-calendar', name: 'Calendario General', holidays: [] }
];
const initialVacationPolicies: VacationPolicy[] = [
    { id: 'default', name: 'General', unit: 'days', amount: 22, countBy: 'workdays', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], assignment: 'all', assignedTo: [] }
];

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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    useEffect(() => {
        if (mode === 'edit' && center) {
            setCenterData(center);
        } else {
            setCenterData({ name: '', address: '', radius: 100, lat: defaultMapCenter.lat, lng: defaultMapCenter.lng, timezone: 'Europe/Madrid' });
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
            
            const prevData = centerData || { name: '', radius: 100 };
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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    
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
    const [centers, setCenters] = useState<Center[]>(initialCenters);
    const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
    const [dialogCenterMode, setDialogCenterMode] = useState<'add' | 'edit'>('add');
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [authError, setAuthError] = useState(false);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    useEffect(() => {
        const handleAuthError = () => setAuthError(true);
        window.addEventListener('gm_authFailure', handleAuthError);
        return () => window.removeEventListener('gm_authFailure', handleAuthError);
    }, []);

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
            setCenters(prev => prev.map(c => (c.name === selectedCenter.name ? centerData : c)));
        }
        setIsCenterDialogOpen(false);
    };

    const handleDeleteCenter = (centerName: string) => {
        setCenters(prev => prev.filter(c => c.name !== centerName));
    };

    return (
        <>
            {authError && apiKey && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error de Autenticación de Google Maps</AlertTitle>
                    <AlertDescription>
                        Tu clave de API ha sido rechazada. Por favor, asegúrate de que esté configurada correctamente para tu proyecto en Google Cloud Console. Verifica estos puntos:
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>La <strong>facturación está habilitada</strong> para el proyecto.</li>
                            <li>Las APIs <strong>"Maps JavaScript API"</strong>, <strong>"Places API"</strong> y <strong>"Time Zone API"</strong> están habilitadas.</li>
                            <li>La clave de API <strong>no tiene restricciones</strong> o, si las tiene, permiten el dominio desde el que se realiza la solicitud. Para depurar, prueba a eliminar las restricciones temporalmente.</li>
                        </ol>
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
                {centers.map((center, index) => (
                    <div key={index} className="flex items-center justify-between rounded-xl border p-4">
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
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCenter(center.name)}>
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
        </>
    );
};

const SettingsTabs = () => {
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [breaks, setBreaks] = useState<Break[]>(initialBreaks);
    const [clockInTypes, setClockInTypes] = useState<ClockInType[]>(initialClockInTypes);
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [flexibleSchedules, setFlexibleSchedules] = useState<FlexibleSchedule[]>([]);
    const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>(initialAbsenceTypes);
    const [calendars, setCalendars] = useState<CalendarData[]>(initialCalendars);
    const [vacationPolicies, setVacationPolicies] = useState<VacationPolicy[]>(initialVacationPolicies);
    const [incentives, setIncentives] = useState<Incentive[]>([]);
    
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


    const allSchedules = ['Horario Fijo', 'Horario Flexible', ...shifts.map(s => s.name)];
    
    useEffect(() => {
        const fetchIncentives = async () => {
            try {
                const data = await listIncentives();
                setIncentives(data);
            } catch (error) {
                console.error("Failed to fetch incentives:", error);
            }
        };
        fetchIncentives();
    }, []);

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
    
    const openAddShiftDialog = () => {
        setDialogShiftMode('add');
        setSelectedShift(null);
        setShiftFormData({ name: "09:00", start: "09:00", end: "17:00" });
        setIsShiftDialogOpen(true);
    };

    const openEditShiftDialog = (shift: Shift) => {
        setDialogShiftMode('edit');
        setSelectedShift(shift);
        setShiftFormData({ name: shift.name, start: shift.start, end: shift.end });
        setIsShiftDialogOpen(true);
    };

    const handleShiftFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shiftFormData.name) return;
        if (dialogShiftMode === 'add') {
            setShifts(prev => [...prev, { id: Date.now().toString(), ...shiftFormData }]);
        } else if (selectedShift) {
            setShifts(prev => prev.map(s => s.id === selectedShift.id ? { ...s, ...shiftFormData } : s));
        }
        setIsShiftDialogOpen(false);
    };

    const handleDeleteShift = (shiftId: string) => {
        setShifts(prev => prev.filter(s => s.id !== shiftId));
    };

    const openAddFlexibleScheduleDialog = () => {
        setDialogFlexibleScheduleMode('add');
        setSelectedFlexibleSchedule(null);
        setFlexibleScheduleFormData({ name: "", workDays: [], hoursPerDay: 8, noWeeklyHours: false });
        setIsFlexibleScheduleDialogOpen(true);
    };

    const openEditFlexibleScheduleDialog = (schedule: FlexibleSchedule) => {
        setDialogFlexibleScheduleMode('edit');
        setSelectedFlexibleSchedule(schedule);
        setFlexibleScheduleFormData(schedule);
    };
    
    const handleFlexibleScheduleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!flexibleScheduleFormData.name) return;
        if (dialogFlexibleScheduleMode === 'add') {
            setFlexibleSchedules(prev => [...prev, { id: Date.now().toString(), ...flexibleScheduleFormData }]);
        } else if (selectedFlexibleSchedule) {
            setFlexibleSchedules(prev => prev.map(s => s.id === selectedFlexibleSchedule.id ? { id: s.id, ...flexibleScheduleFormData } : s));
        }
        setIsFlexibleScheduleDialogOpen(false);
    };

    const handleDeleteFlexibleSchedule = (scheduleId: string) => {
        setFlexibleSchedules(prev => prev.filter(s => s.id !== scheduleId));
    };
    
    const openAddFixedScheduleDialog = () => {
        setDialogFixedScheduleMode('add');
        setSelectedFixedSchedule(null);
        setFixedScheduleFormData({ name: "", workDays: [], ranges: [{ id: Date.now().toString(), start: "09:00", end: "17:00" }], isNightShift: false });
        setIsFixedScheduleDialogOpen(true);
    };
    
    const openEditFixedScheduleDialog = (schedule: FixedSchedule) => {
        setDialogFixedScheduleMode('edit');
        setSelectedFixedSchedule(schedule);
        setFixedScheduleFormData(schedule);
    };

    const handleFixedScheduleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fixedScheduleFormData.name) return;
        if (dialogFixedScheduleMode === 'add') {
            setFixedSchedules(prev => [...prev, { id: Date.now().toString(), ...fixedScheduleFormData }]);
        } else if (selectedFixedSchedule) {
            setFixedSchedules(prev => prev.map(s => s.id === selectedFixedSchedule.id ? { id: s.id, ...fixedScheduleFormData } : s));
        }
        setIsFixedScheduleDialogOpen(false);
    };

    const handleDeleteFixedSchedule = (scheduleId: string) => {
        setFixedSchedules(prev => prev.filter(s => s.id !== scheduleId));
    };

    const openAddAbsenceTypeDialog = () => {
        setDialogAbsenceTypeMode('add');
        setSelectedAbsenceType(null);
        setAbsenceTypeFormData({ name: '', color: 'bg-blue-500', remunerated: true, unit: 'days', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], requiresApproval: true, allowAttachment: false, isDisabled: false, assignment: 'all', assignedTo: [] });
        setIsAbsenceTypeDialogOpen(true);
    };

    const openEditAbsenceTypeDialog = (type: AbsenceType) => {
        setDialogAbsenceTypeMode('edit');
        setSelectedAbsenceType(type);
        setAbsenceTypeFormData({
            ...type,
            blockedPeriods: type.blockedPeriods ?? []
        });
        setIsAbsenceTypeDialogOpen(true);
    };

    const handleAbsenceTypeFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!absenceTypeFormData.name) return;
        
        const payload = {...absenceTypeFormData, requestLimit: Number(absenceTypeFormData.requestLimit || 0)};

        if (dialogAbsenceTypeMode === 'add') {
            setAbsenceTypes(prev => [...prev, { id: Date.now().toString(), ...payload }]);
        } else if (selectedAbsenceType) {
            setAbsenceTypes(prev => prev.map(t => t.id === selectedAbsenceType.id ? { ...t, ...payload } : t));
        }
        setIsAbsenceTypeDialogOpen(false);
    };

    const handleDeleteAbsenceType = (id: string) => {
        setAbsenceTypes(prev => prev.filter(t => t.id !== id));
    };
    
    const handleSelectCalendar = (id: string) => {
        setSelectedCalendarId(id);
    };

    const handleBackToCalendars = () => {
        setSelectedCalendarId(null);
    };
    
    const handleCalendarFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCalendarName) return;
        setCalendars(prev => [...prev, { id: Date.now().toString(), name: newCalendarName, holidays: [] }]);
        setNewCalendarName("");
        setIsCalendarDialogOpen(false);
    };

    const handleDeleteCalendar = (id: string) => {
        setCalendars(prev => prev.filter(c => c.id !== id));
    };
    
    const handleHolidayFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!holidayFormData.name || !holidayFormData.date || !selectedCalendarId) return;
        
        const newHoliday: Holiday = {
            id: `custom-${Date.now()}-${Math.random()}`,
            name: holidayFormData.name,
            date: holidayFormData.date.toISOString(),
        };
        
        setCalendars(prev => prev.map(cal => 
            cal.id === selectedCalendarId ? { ...cal, holidays: [...cal.holidays, newHoliday] } : cal
        ));
        
        setIsHolidayDialogOpen(false);
        setHolidayFormData({ name: "", date: undefined });
    };

    const handleDeleteHoliday = (holidayId: string) => {
        if (!selectedCalendarId) return;
        setCalendars(prev => prev.map(cal => 
            cal.id === selectedCalendarId ? { ...cal, holidays: cal.holidays.filter(h => h.id !== holidayId) } : cal
        ));
    };
    
    const handleImportHolidays = () => {
        if (!selectedCalendarId) return;
        
        const mockHolidays: Holiday[] = [
            { id: `mock-1-${Date.now()}-${Math.random()}`, name: 'Año Nuevo', date: new Date(new Date().getFullYear(), 0, 1).toISOString() },
            { id: `mock-2-${Date.now()}-${Math.random()}`, name: 'Día del Trabajador', date: new Date(new Date().getFullYear(), 4, 1).toISOString() },
            { id: `mock-3-${Date.now()}-${Math.random()}`, name: 'Navidad', date: new Date(new Date().getFullYear(), 11, 25).toISOString() },
        ];
        
        setCalendars(prev => prev.map(cal => 
            cal.id === selectedCalendarId ? { ...cal, holidays: [...cal.holidays, ...mockHolidays].filter((holiday, index, self) => index === self.findIndex(t => t.name === holiday.name))} : cal
        ));
    };

    const openAddVacationPolicyDialog = () => {
        setDialogVacationPolicyMode('add');
        setSelectedVacationPolicy(null);
        setVacationPolicyFormData({ name: '', unit: 'days', amount: 22, countBy: 'workdays', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], assignment: 'all', assignedTo: [] });
        setIsVacationPolicyDialogOpen(true);
    };

    const openEditVacationPolicyDialog = (policy: VacationPolicy) => {
        setDialogVacationPolicyMode('edit');
        setSelectedVacationPolicy(policy);
        setVacationPolicyFormData({ 
            ...policy,
            requestLimit: policy.requestLimit || 0,
            blockedPeriods: policy.blockedPeriods || [],
            assignment: policy.assignment || 'all',
            assignedTo: policy.assignedTo || []
        });
        setIsVacationPolicyDialogOpen(true);
    };
    
    const handleVacationPolicyFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vacationPolicyFormData.name) return;
        const payload = { ...vacationPolicyFormData, amount: Number(vacationPolicyFormData.amount), requestLimit: Number(vacationPolicyFormData.requestLimit || 0) };

        if (dialogVacationPolicyMode === 'add') {
            setVacationPolicies(prev => [...prev, { id: Date.now().toString(), ...payload }]);
        } else if (selectedVacationPolicy) {
            setVacationPolicies(prev => prev.map(p => p.id === selectedVacationPolicy.id ? { ...p, ...payload } : p));
        }
        setIsVacationPolicyDialogOpen(false);
    };

    const handleDeleteVacationPolicy = (id: string) => {
        setVacationPolicies(prev => prev.filter(p => p.id !== id));
    };

    const openAddIncentiveDialog = () => {
        setDialogIncentiveMode('add');
        setSelectedIncentive(null);
        setIncentiveFormData({ name: "", type: "económico", value: "", period: "anual", active: true, condition_expression: { modality: 'all-or-nothing' } });
        setIsIncentiveDialogOpen(true);
    };

    const openEditIncentiveDialog = (incentive: Incentive) => {
        setDialogIncentiveMode('edit');
        setSelectedIncentive(incentive);
        setIncentiveFormData({
            ...incentive,
            condition_expression: incentive.condition_expression || { modality: 'all-or-nothing' }
        });
    };

    const handleIncentiveFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!incentiveFormData.name) return;
        
        const newIncentiveData = {...incentiveFormData};
        // Ensure condition_expression is an object
        if (typeof newIncentiveData.condition_expression === 'string') {
            try {
                newIncentiveData.condition_expression = JSON.parse(newIncentiveData.condition_expression);
            } catch {
                newIncentiveData.condition_expression = { modality: 'all-or-nothing' };
            }
        }


        if (dialogIncentiveMode === 'add') {
            const saved = await createIncentive(newIncentiveData);
            setIncentives(prev => [...prev, saved]);
        } else if (selectedIncentive) {
            // Update logic would go here (requires a PUT/PATCH endpoint)
            const updatedIncentive = { ...selectedIncentive, ...newIncentiveData };
            setIncentives(prev => prev.map(i => i.id === selectedIncentive.id ? updatedIncentive : i));
        }
        setIsIncentiveDialogOpen(false);
    };
    
    const handleDeleteIncentive = (id: string) => {
        // Delete logic would go here (requires a DELETE endpoint)
        setIncentives(prev => prev.filter(i => i.id !== id));
    };


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
                            {roles.map((role, index) => (
                                <div key={index} className="flex items-center justify-between rounded-xl border p-4">
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
                                <DialogTitle>
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
                
                <TabsContent value="centers" className="space-y-4 m-0">
                    <CentersTabContent />
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
                            {departments.map((dept, index) => (
                                <div key={index} className="flex items-center justify-between rounded-xl border p-4">
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

                <TabsContent value="schedules" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Horarios Flexibles</CardTitle>
                            <Button onClick={openAddFlexibleScheduleDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Horario Flexible</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {flexibleSchedules.map(schedule => (
                                <div key={schedule.id} className="flex items-center justify-between rounded-xl border p-4">
                                    <div>
                                        <h3 className="font-semibold">{schedule.name}</h3>
                                        <p className="text-sm text-muted-foreground">{schedule.noWeeklyHours ? "Sin límite de horas" : `${schedule.hoursPerDay * schedule.workDays.length}h semanales (${schedule.workDays.join(', ')})`}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="sm" onClick={() => openEditFlexibleScheduleDialog(schedule)}>Editar</Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFlexibleSchedule(schedule.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Horarios Fijos</CardTitle>
                            <Button onClick={openAddFixedScheduleDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Horario Fijo</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fixedSchedules.map(schedule => (
                                <div key={schedule.id} className="flex items-center justify-between rounded-xl border p-4">
                                    <div>
                                        <h3 className="font-semibold">{schedule.name}</h3>
                                        <p className="text-sm text-muted-foreground">{schedule.ranges.map(r => `${r.start}-${r.end}`).join(', ')} ({schedule.workDays.join(', ')})</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="sm" onClick={() => openEditFixedScheduleDialog(schedule)}>Editar</Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFixedSchedule(schedule.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Turnos de Trabajo</CardTitle>
                            <Button onClick={openAddShiftDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Turno</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {shifts.map(shift => (
                                <div key={shift.id} className="flex items-center justify-between rounded-xl border p-4">
                                    <div>
                                        <h3 className="font-semibold">{shift.name}</h3>
                                        <p className="text-sm text-muted-foreground">{shift.start} - {shift.end}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="sm" onClick={() => openEditShiftDialog(shift)}>Editar</Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteShift(shift.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <Dialog open={isFlexibleScheduleDialogOpen} onOpenChange={setIsFlexibleScheduleDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{dialogFlexibleScheduleMode === 'add' ? 'Nuevo Horario Flexible' : 'Editar Horario Flexible'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleFlexibleScheduleFormSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="flex-name">Nombre del Horario</Label>
                                <Input id="flex-name" value={flexibleScheduleFormData.name} onChange={e => setFlexibleScheduleFormData({...flexibleScheduleFormData, name: e.target.value})} required/>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="flex-no-hours" checked={flexibleScheduleFormData.noWeeklyHours} onCheckedChange={checked => setFlexibleScheduleFormData({...flexibleScheduleFormData, noWeeklyHours: checked})} />
                                <Label htmlFor="flex-no-hours">Crear horario sin horas semanales (solo se fichan los días)</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Días laborables</Label>
                                <div className="flex gap-4 flex-wrap pt-2">
                                    {weekDays.map(day => (
                                        <div key={day} className="flex items-center gap-1.5">
                                            <Checkbox id={`flex-day-${day}`} checked={flexibleScheduleFormData.workDays.includes(day)} onCheckedChange={checked => setFlexibleScheduleFormData(prev => ({...prev, workDays: checked ? [...prev.workDays, day] : prev.workDays.filter(d => d !== day)}))}/>
                                            <Label htmlFor={`flex-day-${day}`} className="font-normal">{day}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!flexibleScheduleFormData.noWeeklyHours && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="flex-hours-day">Horas por día</Label>
                                        <Input id="flex-hours-day" type="number" value={flexibleScheduleFormData.hoursPerDay} onChange={e => setFlexibleScheduleFormData({...flexibleScheduleFormData, hoursPerDay: Number(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Horas Semanales</Label>
                                        <Input value={flexibleScheduleFormData.hoursPerDay * flexibleScheduleFormData.workDays.length} readOnly disabled/>
                                    </div>
                                </div>
                            )}
                            <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={isFixedScheduleDialogOpen} onOpenChange={setIsFixedScheduleDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{dialogFixedScheduleMode === 'add' ? 'Nuevo Horario Fijo' : 'Editar Horario Fijo'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleFixedScheduleFormSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="fixed-name">Nombre del Horario</Label>
                                <Input id="fixed-name" value={fixedScheduleFormData.name} onChange={e => setFixedScheduleFormData({...fixedScheduleFormData, name: e.target.value})} required/>
                            </div>
                            <div className="space-y-2">
                                <Label>Días laborables</Label>
                                <div className="flex gap-4 flex-wrap pt-2">
                                    {weekDays.map(day => (
                                        <div key={day} className="flex items-center gap-1.5">
                                            <Checkbox id={`fixed-day-${day}`} checked={fixedScheduleFormData.workDays.includes(day)} onCheckedChange={checked => setFixedScheduleFormData(prev => ({...prev, workDays: checked ? [...prev.workDays, day] : prev.workDays.filter(d => d !== day)}))}/>
                                            <Label htmlFor={`fixed-day-${day}`} className="font-normal">{day}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Rangos Horarios</Label>
                                {fixedScheduleFormData.ranges.map((range, index) => (
                                    <div key={range.id} className="flex items-end gap-2">
                                        <div className="space-y-1.5 flex-1">
                                            <Label htmlFor={`range-start-${index}`}>Inicio</Label>
                                            <Input id={`range-start-${index}`} type="time" value={range.start} onChange={e => setFixedScheduleFormData(prev => ({...prev, ranges: prev.ranges.map(r => r.id === range.id ? {...r, start: e.target.value} : r)}))}/>
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <Label htmlFor={`range-end-${index}`}>Fin</Label>
                                            <Input id={`range-end-${index}`} type="time" value={range.end} onChange={e => setFixedScheduleFormData(prev => ({...prev, ranges: prev.ranges.map(r => r.id === range.id ? {...r, end: e.target.value} : r)}))}/>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" disabled={fixedScheduleFormData.ranges.length <= 1} onClick={() => setFixedScheduleFormData(prev => ({...prev, ranges: prev.ranges.filter(r => r.id !== range.id)}))}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" className="w-full" onClick={() => setFixedScheduleFormData(prev => ({...prev, ranges: [...prev.ranges, {id: Date.now().toString(), start: "", end: ""}]}))}>
                                    <PlusCircle className="mr-2 h-4 w-4"/> Añadir Rango (Jornada Partida)
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="fixed-night-shift" checked={fixedScheduleFormData.isNightShift} onCheckedChange={checked => setFixedScheduleFormData({...fixedScheduleFormData, isNightShift: checked})}/>
                                <Label htmlFor="fixed-night-shift">Horario Nocturno</Label>
                            </div>
                            <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{dialogShiftMode === 'add' ? 'Nuevo Turno' : 'Editar Turno'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleShiftFormSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="shift-name">Nombre del Turno</Label>
                                <Input id="shift-name" value={shiftFormData.name} onChange={e => setShiftFormData({...shiftFormData, name: e.target.value})} required/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shift-start">Hora de Inicio</Label>
                                    <Input id="shift-start" type="time" value={shiftFormData.start} onChange={e => setShiftFormData({...shiftFormData, start: e.target.value})} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shift-end">Hora de Fin</Label>
                                    <Input id="shift-end" type="time" value={shiftFormData.end} onChange={e => setShiftFormData({...shiftFormData, end: e.target.value})} required/>
                                </div>
                            </div>
                            <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <TabsContent value="breaks" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Gestión de Descansos</CardTitle>
                                <CardDescription>Configura los descansos, ya sean remunerados o no.</CardDescription>
                            </div>
                            <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={openAddBreakDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Descanso</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{dialogBreakMode === 'add' ? 'Añadir Nuevo Descanso' : 'Editar Descanso'}</DialogTitle>
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
                                                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-xl">
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
                                                                    checked={(breakFormData.assignedTo || []).includes(scheduleName)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentAssignedTo = breakFormData.assignedTo || [];
                                                                        const newAssignedTo = checked 
                                                                            ? [...currentAssignedTo, scheduleName]
                                                                            : currentAssignedTo.filter(name => name !== scheduleName);
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
                                <div key={index} className="flex items-center justify-between rounded-xl border p-4">
                                    <div>
                                        <h3 className="font-semibold">{br.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {br.remunerated ? 'Remunerado' : 'No remunerado'}
                                            {br.isAutomatic 
                                                ? `, Automático (${br.intervalStart || 'N/A'}-${br.intervalEnd || 'N/A'})` 
                                                : `, Límite: ${br.limit} min`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Asignado a: {(br.assignedTo || []).length > 0 ? (br.assignedTo || []).join(', ') : 'Ninguno'}
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
                
                <TabsContent value="checkin-types" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tipos de Fichaje</CardTitle>
                                <CardDescription>Marca fichajes diferentes al normal, asignando un color para diferenciarlos.</CardDescription>
                            </div>
                            <Dialog open={isClockInTypeDialogOpen} onOpenChange={setIsClockInTypeDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={openAddClockInTypeDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{dialogClockInTypeMode === 'add' ? 'Añadir Nuevo Tipo de Fichaje' : 'Editar Tipo de Fichaje'}</DialogTitle>
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
                                <div key={index} className="flex items-center justify-between rounded-xl border p-4">
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

                <TabsContent value="calendars" className="space-y-4 m-0">
                    {!selectedCalendarId ? (
                        <Card className="bg-gradient-accent-to-card">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Calendarios de Festivos</CardTitle>
                                    <CardDescription>Gestiona calendarios para diferentes centros o departamentos.</CardDescription>
                                </div>
                                <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
                                    <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Calendario</Button></DialogTrigger>
                                    <DialogContent className="sm:max-w-xs">
                                        <DialogHeader><DialogTitle>Crear Nuevo Calendario</DialogTitle></DialogHeader>
                                        <form onSubmit={handleCalendarFormSubmit}>
                                            <div className="grid gap-4 py-4">
                                                <Label htmlFor="cal-name">Nombre del Calendario</Label>
                                                <Input id="cal-name" value={newCalendarName} onChange={e => setNewCalendarName(e.target.value)} required />
                                            </div>
                                            <DialogFooter><Button type="submit">Crear</Button></DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {calendars.map(cal => (
                                    <div key={cal.id} className="flex items-center justify-between rounded-xl border p-4">
                                        <div>
                                            <h3 className="font-semibold">{cal.name}</h3>
                                            <p className="text-sm text-muted-foreground">{cal.holidays.length} festivos</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleSelectCalendar(cal.id)}>Gestionar</Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCalendar(cal.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={handleBackToCalendars}><ArrowLeft className="mr-2 h-4 w-4"/> Volver a Calendarios</Button>
                            <Card className="bg-gradient-accent-to-card">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>{selectedCalendar?.name}</CardTitle>
                                        <CardDescription>Gestiona los festivos de este calendario.</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleImportHolidays}>Importar Festivos</Button>
                                        <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                                            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Festivo</Button></DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader><DialogTitle>Añadir Festivo Personalizado</DialogTitle></DialogHeader>
                                                <form onSubmit={handleHolidayFormSubmit} className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="holiday-name">Nombre del Festivo</Label>
                                                        <Input id="holiday-name" value={holidayFormData.name} onChange={e => setHolidayFormData({...holidayFormData, name: e.target.value})} required/>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Fecha</Label>
                                                        <Popover modal={true}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className={cn("w-full justify-start text-left font-normal", !holidayFormData.date && "text-muted-foreground")}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {holidayFormData.date ? format(holidayFormData.date, "PPP") : <span>Elige una fecha</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar 
                                                                    mode="single" 
                                                                    selected={holidayFormData.date} 
                                                                    onSelect={(date) => {
                                                                    setHolidayFormData(prev => ({...prev, date}));
                                                                    }}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit">Añadir Festivo</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <Calendar mode="multiple" selected={holidayDates} className="rounded-lg border"/>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Lista de Festivos</h4>
                                        <ScrollArea className="h-72">
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right"></TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                {selectedCalendar?.holidays.map(holiday => (
                                                    <TableRow key={holiday.id}>
                                                        <TableCell>{holiday.name}</TableCell>
                                                        <TableCell>{format(new Date(holiday.date), "PPP")}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteHoliday(holiday.id)}><Trash2 className="h-4 w-4"/></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="vacations" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Políticas de Vacaciones</CardTitle>
                                <CardDescription>Establece las políticas de vacaciones para la empresa.</CardDescription>
                            </div>
                            <Button onClick={openAddVacationPolicyDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Política</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {vacationPolicies.map(policy => (
                                <div key={policy.id} className="flex items-center justify-between rounded-xl border p-4">
                                    <div>
                                        <h3 className="font-semibold">{policy.name}</h3>
                                        <p className="text-sm text-muted-foreground">{policy.amount} {policy.unit === 'days' ? 'días' : 'horas'} por año</p>
                                        <p className="text-sm text-muted-foreground">
                                            {policy.assignment === 'all'
                                            ? 'Asignado a: Toda la empresa'
                                            : `Asignado a: ${policy.assignedTo.length} empleado(s)`}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="sm" onClick={() => openEditVacationPolicyDialog(policy)}>Editar</Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVacationPolicy(policy.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Dialog open={isVacationPolicyDialogOpen} onOpenChange={(open) => { if (!open) setNewBlockedPeriod(undefined); setIsVacationPolicyDialogOpen(open); }}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>{dialogVacationPolicyMode === 'add' ? 'Añadir Política de Vacaciones' : 'Editar Política de Vacaciones'}</DialogTitle></DialogHeader>
                            <form onSubmit={handleVacationPolicyFormSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="policy-name">Nombre de la Política</Label>
                                    <Input id="policy-name" value={vacationPolicyFormData.name} onChange={e => setVacationPolicyFormData({...vacationPolicyFormData, name: e.target.value})} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Unidad de Cómputo</Label>
                                    <RadioGroup value={vacationPolicyFormData.unit} onValueChange={(value: 'days' | 'hours') => setVacationPolicyFormData({...vacationPolicyFormData, unit: value})} className="flex gap-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="days" id="unit-days"/><Label htmlFor="unit-days">Días</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="hours" id="unit-hours"/><Label htmlFor="unit-hours">Horas</Label></div>
                                    </RadioGroup>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="policy-amount">Cantidad de {vacationPolicyFormData.unit === 'days' ? 'Días' : 'Horas'} al Año</Label>
                                    <Input id="policy-amount" type="number" value={vacationPolicyFormData.amount} onChange={e => setVacationPolicyFormData({...vacationPolicyFormData, amount: Number(e.target.value)})} required/>
                                </div>
                                {vacationPolicyFormData.unit === 'days' && (
                                    <div className="space-y-2">
                                        <Label>Contar como</Label>
                                        <RadioGroup value={vacationPolicyFormData.countBy} onValueChange={(value: 'workdays' | 'natural') => setVacationPolicyFormData({...vacationPolicyFormData, countBy: value})} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="workdays" id="count-workdays"/><Label htmlFor="count-workdays">Días Laborales</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="natural" id="count-natural"/><Label htmlFor="count-natural">Días Naturales</Label></div>
                                        </RadioGroup>
                                    </div>
                                )}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="policy-limit" checked={vacationPolicyFormData.limitRequests} onCheckedChange={checked => setVacationPolicyFormData({...vacationPolicyFormData, limitRequests: checked})} />
                                        <Label htmlFor="policy-limit">Limitar número de solicitudes</Label>
                                    </div>
                                    {vacationPolicyFormData.limitRequests && (
                                        <div className="pl-8 space-y-2">
                                            <Label htmlFor="policy-request-limit">Número máximo de solicitudes al año</Label>
                                            <Input id="policy-request-limit" type="number" value={vacationPolicyFormData.requestLimit} onChange={e => setVacationPolicyFormData({...vacationPolicyFormData, requestLimit: Number(e.target.value || 0)})} />
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <Switch id="policy-block" checked={vacationPolicyFormData.blockPeriods} onCheckedChange={checked => setVacationPolicyFormData({...vacationPolicyFormData, blockPeriods: checked})} />
                                        <Label htmlFor="policy-block">Bloquear periodos</Label>
                                    </div>
                                </div>
                                {vacationPolicyFormData.blockPeriods && (
                                    <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
                                        <Label className="font-medium">Periodos Bloqueados</Label>
                                        <div className="space-y-2">
                                            {(vacationPolicyFormData.blockedPeriods || []).map((period) => (
                                                <div key={period.id} className="flex items-center justify-between text-sm bg-background p-2 rounded-md">
                                                    <span>{format(new Date(period.from), 'd LLL, y')} - {format(new Date(period.to), 'd LLL, y')}</span>
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                        setVacationPolicyFormData(prev => ({
                                                            ...prev,
                                                            blockedPeriods: (prev.blockedPeriods || []).filter(p => p.id !== period.id)
                                                        }))
                                                    }}>
                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {(vacationPolicyFormData.blockedPeriods || []).length === 0 && (
                                                <p className="text-sm text-muted-foreground px-2">No hay periodos bloqueados.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal bg-background",
                                                            !newBlockedPeriod && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {newBlockedPeriod?.from ? (
                                                            newBlockedPeriod.to ? (
                                                                <>
                                                                    {format(newBlockedPeriod.from, "LLL dd, y")} -{" "}
                                                                    {format(newBlockedPeriod.to, "LLL dd, y")}
                                                                </>
                                                            ) : (
                                                                format(newBlockedPeriod.from, "LLL dd, y")
                                                            )
                                                        ) : (
                                                            <span>Selecciona un rango</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        selected={newBlockedPeriod}
                                                        onSelect={setNewBlockedPeriod}
                                                        numberOfMonths={1}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <Button type="button" size="sm" onClick={() => {
                                                if (newBlockedPeriod?.from && newBlockedPeriod?.to) {
                                                    const newPeriod = {
                                                        id: Date.now().toString(),
                                                        from: newBlockedPeriod.from.toISOString(),
                                                        to: newBlockedPeriod.to.toISOString(),
                                                    };
                                                    setVacationPolicyFormData(prev => ({
                                                        ...prev,
                                                        blockedPeriods: [...(prev.blockedPeriods || []), newPeriod]
                                                    }));
                                                    setNewBlockedPeriod(undefined);
                                                }
                                            }} disabled={!newBlockedPeriod?.from || !newBlockedPeriod?.to}>
                                                Añadir
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Asignar a</Label>
                                    <RadioGroup
                                        value={vacationPolicyFormData.assignment}
                                        onValueChange={(value: 'all' | 'specific') =>
                                            setVacationPolicyFormData({ ...vacationPolicyFormData, assignment: value, assignedTo: [] })
                                        }
                                        className="flex gap-4 pt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="all" id="vac-assign-all" />
                                            <Label htmlFor="vac-assign-all">Toda la empresa</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="specific" id="vac-assign-specific" />
                                            <Label htmlFor="vac-assign-specific">Empleados específicos</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {vacationPolicyFormData.assignment === 'specific' && (
                                    <div className="space-y-2">
                                        <Label>Empleados</Label>
                                        <ScrollArea className="h-40 rounded-md border p-4">
                                            <div className="space-y-2">
                                                {employees.map((employee) => (
                                                    <div key={`vac-emp-${employee.id}`} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`vac-emp-check-${employee.id}`}
                                                            checked={(vacationPolicyFormData.assignedTo || []).includes(employee.name)}
                                                            onCheckedChange={(checked) => {
                                                                const newAssignedTo = checked
                                                                    ? [...(vacationPolicyFormData.assignedTo || []), employee.name]
                                                                    : (vacationPolicyFormData.assignedTo || []).filter((name) => name !== employee.name);
                                                                setVacationPolicyFormData({ ...vacationPolicyFormData, assignedTo: newAssignedTo });
                                                            }}
                                                        />
                                                        <Label htmlFor={`vac-emp-check-${employee.id}`} className="font-normal">
                                                            {employee.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                                <DialogFooter><Button type="submit">Guardar Política</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
                
                <TabsContent value="absences" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tipos de Ausencia</CardTitle>
                                <CardDescription>Crea y configura diferentes tipos de permisos y ausencias.</CardDescription>
                            </div>
                            <Button onClick={openAddAbsenceTypeDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {absenceTypes.map((absence) => (
                                <div key={absence.id} className="flex items-center justify-between rounded-xl border p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-4 w-4 rounded-full ${absence.color}`}></div>
                                        <div>
                                            <h3 className="font-semibold">{absence.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Remunerado: {absence.remunerated ? 'Sí' : 'No'} | Unidad: {absence.unit === 'days' ? 'Días' : 'Horas'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="sm" onClick={() => openEditAbsenceTypeDialog(absence)}>Editar</Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAbsenceType(absence.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Dialog open={isAbsenceTypeDialogOpen} onOpenChange={(open) => { if (!open) setNewAbsenceBlockedPeriod(undefined); setIsAbsenceTypeDialogOpen(open); }}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{dialogAbsenceTypeMode === 'add' ? 'Añadir Tipo de Ausencia' : 'Editar Tipo de Ausencia'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAbsenceTypeFormSubmit} className="space-y-4 py-4">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="absence-name">Nombre de la Ausencia</Label>
                                        <Input id="absence-name" value={absenceTypeFormData.name} onChange={e => setAbsenceTypeFormData({...absenceTypeFormData, name: e.target.value})} required/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <RadioGroup value={absenceTypeFormData.color} onValueChange={(value) => setAbsenceTypeFormData({...absenceTypeFormData, color: value})} className="flex flex-wrap gap-4 pt-2">
                                        {projectColors.map(color => (
                                            <div key={color.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={color.value} id={`absence-color-${color.value}`} className="h-6 w-6 border-0 p-0 data-[state=checked]:ring-2 ring-offset-background ring-ring">
                                                    <div className={`h-full w-full rounded-full ${color.value}`}></div>
                                                </RadioGroupItem>
                                            </div>
                                        ))}
                                        </RadioGroup>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="absence-remunerated" checked={absenceTypeFormData.remunerated} onCheckedChange={checked => setAbsenceTypeFormData({...absenceTypeFormData, remunerated: checked})} />
                                        <Label htmlFor="absence-remunerated">Remunerado (cuenta como tiempo trabajado)</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Contabilizar en</Label>
                                        <RadioGroup value={absenceTypeFormData.unit} onValueChange={(value: 'days' | 'hours') => setAbsenceTypeFormData({...absenceTypeFormData, unit: value})} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="days" id="unit-days-abs"/><Label htmlFor="unit-days-abs">Días</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="hours" id="unit-hours-abs"/><Label htmlFor="unit-hours-abs">Horas</Label></div>
                                        </RadioGroup>
                                    </div>

                                    <Separator/>
                                    
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch id="absence-requires-approval" checked={absenceTypeFormData.requiresApproval} onCheckedChange={checked => setAbsenceTypeFormData({...absenceTypeFormData, requiresApproval: checked})} />
                                            <Label htmlFor="absence-requires-approval">Solicitud requiere aprobación</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch id="absence-allow-attachment" checked={absenceTypeFormData.allowAttachment} onCheckedChange={checked => setAbsenceTypeFormData({...absenceTypeFormData, allowAttachment: checked})} />
                                            <Label htmlFor="absence-allow-attachment">Permitir adjuntar documento de justificación</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch id="absence-is-disabled" checked={absenceTypeFormData.isDisabled} onCheckedChange={checked => setAbsenceTypeFormData({...absenceTypeFormData, isDisabled: checked})} />
                                            <Label htmlFor="absence-is-disabled">Deshabilitar para que no se pueda solicitar</Label>
                                        </div>

                                        <Separator className="my-3"/>

                                        <div className="flex items-center space-x-2">
                                            <Switch id="absence-limit" checked={absenceTypeFormData.limitRequests} onCheckedChange={checked => setAbsenceTypeFormData({...absenceTypeFormData, limitRequests: checked})} />
                                            <Label htmlFor="absence-limit">Limitar número de solicitudes</Label>
                                        </div>
                                        {absenceTypeFormData.limitRequests && (
                                            <div className="pl-8 space-y-2">
                                                <Label htmlFor="absence-request-limit">Número máximo de solicitudes</Label>
                                                <Input id="absence-request-limit" type="number" value={absenceTypeFormData.requestLimit} onChange={e => setAbsenceTypeFormData({...absenceTypeFormData, requestLimit: Number(e.target.value || 0)})} />
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <Switch id="absence-block" checked={absenceTypeFormData.blockPeriods} onCheckedChange={checked => setAbsenceTypeFormData({...absenceTypeFormData, blockPeriods: checked})} />
                                            <Label htmlFor="absence-block">Bloquear periodos de solicitud</Label>
                                        </div>
                                    </div>
                                    {absenceTypeFormData.blockPeriods && (
                                        <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
                                            <Label className="font-medium">Periodos Bloqueados</Label>
                                            <div className="space-y-2">
                                                {(absenceTypeFormData.blockedPeriods || []).map((period) => (
                                                    <div key={period.id} className="flex items-center justify-between text-sm bg-background p-2 rounded-md">
                                                        <span>{format(new Date(period.from), 'd LLL, y')} - {format(new Date(period.to), 'd LLL, y')}</span>
                                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                            setAbsenceTypeFormData(prev => ({
                                                                ...prev,
                                                                blockedPeriods: (prev.blockedPeriods || []).filter(p => p.id !== period.id)
                                                            }))
                                                        }}>
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {(absenceTypeFormData.blockedPeriods || []).length === 0 && (
                                                    <p className="text-sm text-muted-foreground px-2">No hay periodos bloqueados.</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Popover modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal bg-background",
                                                                !newAbsenceBlockedPeriod && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {newAbsenceBlockedPeriod?.from ? (
                                                                newAbsenceBlockedPeriod.to ? (
                                                                    <>
                                                                        {format(newAbsenceBlockedPeriod.from, "LLL dd, y")} -{" "}
                                                                        {format(newAbsenceBlockedPeriod.to, "LLL dd, y")}
                                                                    </>
                                                                ) : (
                                                                    format(newAbsenceBlockedPeriod.from, "LLL dd, y")
                                                                )
                                                            ) : (
                                                                <span>Selecciona un rango</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            initialFocus
                                                            mode="range"
                                                            selected={newAbsenceBlockedPeriod}
                                                            onSelect={setNewAbsenceBlockedPeriod}
                                                            numberOfMonths={1}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Button type="button" size="sm" onClick={() => {
                                                    if (newAbsenceBlockedPeriod?.from && newAbsenceBlockedPeriod?.to) {
                                                        const newPeriod = {
                                                            id: Date.now().toString(),
                                                            from: newAbsenceBlockedPeriod.from.toISOString(),
                                                            to: newAbsenceBlockedPeriod.to.toISOString(),
                                                        };
                                                        setAbsenceTypeFormData(prev => ({
                                                            ...prev,
                                                            blockedPeriods: [...(prev.blockedPeriods || []), newPeriod]
                                                        }));
                                                        setNewAbsenceBlockedPeriod(undefined);
                                                    }
                                                }} disabled={!newAbsenceBlockedPeriod?.from || !newAbsenceBlockedPeriod?.to}>
                                                    Añadir
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label>Asignar a</Label>
                                        <RadioGroup 
                                            value={absenceTypeFormData.assignment} 
                                            onValueChange={(value: 'all' | 'specific') => setAbsenceTypeFormData({...absenceTypeFormData, assignment: value, assignedTo: []})} 
                                            className="flex gap-4 pt-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="all" id="abs-assign-all"/>
                                                <Label htmlFor="abs-assign-all">Toda la empresa</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="specific" id="abs-assign-specific"/>
                                                <Label htmlFor="abs-assign-specific">Empleados específicos</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    {absenceTypeFormData.assignment === 'specific' && (
                                        <div className="space-y-2">
                                            <Label>Empleados</Label>
                                            <ScrollArea className="h-40 rounded-md border p-4">
                                                <div className="space-y-2">
                                                    {employees.map(employee => (
                                                        <div key={`abs-emp-${employee.id}`} className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`abs-emp-check-${employee.id}`}
                                                                checked={(absenceTypeFormData.assignedTo || []).includes(employee.name)}
                                                                onCheckedChange={(checked) => {
                                                                    const newAssignedTo = checked 
                                                                        ? [...(absenceTypeFormData.assignedTo || []), employee.name]
                                                                        : (absenceTypeFormData.assignedTo || []).filter(name => name !== employee.name);
                                                                    setAbsenceTypeFormData({...absenceTypeFormData, assignedTo: newAssignedTo});
                                                                }}
                                                            />
                                                            <Label htmlFor={`abs-emp-check-${employee.id}`} className="font-normal">{employee.name}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
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
                            <Table>
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
                            </Table>
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

                <TabsContent value="automations" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Automatizaciones de Jornada</CardTitle>
                            <CardDescription>Configura acciones automáticas para los fichajes de los empleados.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-xl border p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">Cierre Automático al Cumplir Horario</h3>
                                        <p className="text-sm text-muted-foreground">Cierra el fichaje cuando el empleado completa su jornada.</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="pl-4 space-y-3 border-l-2 ml-2">
                                    <RadioGroup defaultValue="by_hours">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="by_hours" id="auto-close-hours" />
                                            <Label htmlFor="auto-close-hours" className="font-normal">Según horas de jornada</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="by_schedule" id="auto-close-schedule" />
                                            <Label htmlFor="auto-close-schedule" className="font-normal">Según horario fijo o turno (cierre semanal)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <div className="rounded-xl border p-4 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">Cierre Automático por Olvido</h3>
                                        <p className="text-sm text-muted-foreground">Establece una hora tope para cerrar fichajes abiertos.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="pl-4 space-y-3 border-l-2 ml-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="forgot-time">Hora de Cierre</Label>
                                        <Input id="forgot-time" type="time" defaultValue="23:59" className="w-40"/>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm mb-2">Notificaciones por olvido</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Switch id="notify-forgot-admin" defaultChecked/>
                                                <Label htmlFor="notify-forgot-admin" className="font-normal">Email al administrador</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="notify-forgot-employee" defaultChecked/>
                                                <Label htmlFor="notify-forgot-employee" className="font-normal">Email al empleado (para que resuelva la incidencia)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="notify-forgot-push"/>
                                                <Label htmlFor="notify-forgot-push" className="font-normal">Notificación a la app del empleado</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Permisos de Empleado</CardTitle>
                            <CardDescription>Restringe la visibilidad de ciertas secciones para los empleados.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <h3 className="font-semibold">Ver "Husin" y "Timeline"</h3>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <h3 className="font-semibold">Ver calendario de ausencias del equipo</h3>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <h3 className="font-semibold">Editar su propio perfil</h3>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Autenticación</CardTitle>
                            <CardDescription>Gestiona la configuración de seguridad de tu cuenta.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-xl border p-4">
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

                <TabsContent value="integrations" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Integraciones de Aplicaciones</CardTitle>
                            <CardDescription>Conecta WorkFlow Central con tus herramientas favoritas.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="bg-gradient-accent-to-card">
                                <CardHeader><CardTitle className="text-lg">Slack</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground mb-4">Recibe notificaciones en Slack.</p><Button className="w-full">Conectar</Button></CardContent>
                            </Card>
                            <Card className="bg-gradient-accent-to-card">
                                <CardHeader><CardTitle className="text-lg">Google Calendar</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground mb-4">Sincroniza ausencias y horarios.</p><Button className="w-full">Conectar</Button></CardContent>
                            </Card>
                            <Card className="bg-gradient-accent-to-card">
                                <CardHeader><CardTitle className="text-lg">QuickBooks</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground mb-4">Sincroniza datos de nómina.</p><Button className="w-full" variant="secondary" disabled>Conectado</Button></CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4 m-0">
                    <Card className="bg-gradient-accent-to-card">
                        <CardHeader>
                            <CardTitle>Preferencias de Notificaciones</CardTitle>
                            <CardDescription>Gestiona cómo recibes las notificaciones como administrador.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <div>
                                    <h3 className="font-semibold">Nuevas Solicitudes de Ausencia</h3>
                                    <p className="text-sm text-muted-foreground">Notificar por email cuando un empleado solicite tiempo libre.</p>
                                </div>
                                <Switch defaultChecked aria-label="Toggle absence request notifications" />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <div>
                                    <h3 className="font-semibold">Alertas de Finalización de Proyecto</h3>
                                    <p className="text-sm text-muted-foreground">Recibir un email cuando un proyecto se marque como completado.</p>
                                </div>
                                <Switch defaultChecked aria-label="Toggle project completion notifications" />
                            </div>
                            <div className="flex items-center justify-between rounded-xl border p-4">
                                <div>
                                    <h3 className="font-semibold">Resumen Semanal de Actividad</h3>
                                    <p className="text-sm text-muted-foreground">Enviar un resumen de la actividad del equipo cada lunes.</p>
                                </div>
                                <Switch aria-label="Toggle weekly summary notifications" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
    );
};


export default function SettingsPage() {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null; // or a loading skeleton
    }
    
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
