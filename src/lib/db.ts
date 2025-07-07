import type { Incentive, Project, Objective, Task, Employee, Center, Department, Role, Break, ClockInType, Shift, FlexibleSchedule, FixedSchedule, AbsenceType, CalendarData, VacationPolicy } from './api';

// This file simulates a database. In a real production app, you would connect to a real database
// like Firestore, PostgreSQL, etc., inside your API routes. The API routes would then query
// the database instead of this `db` object.

const defaultMapCenter = { lat: 40.416775, lng: -3.703790 };

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

export const db = {
    // Incentives
    incentives: [
        { id: "a1b2c3d4-0001-0001-0001-000000000001", name: "Bonus Q1 Ventas", type: "económico", value: "1000", period: "trimestral", active: true, company_id: "c1d2e3f4-0000-0000-0000-000000000000", condition_expression: { modality: 'all-or-nothing' } },
        { id: "a1b2c3d4-0001-0001-0001-000000000002", name: "Días extra por rendimiento", type: "días_libres", value: "2", period: "anual", active: true, company_id: "c1d2e3f4-0000-0000-0000-000000000000", condition_expression: { modality: 'proportional' } },
    ] as Incentive[],

    // Projects
    projects: [
        { id: "b1c2d3e4-0002-0002-0002-000000000001", name: "Rediseño Web Corporativa", description: "Modernizar la web principal de la empresa." },
        { id: "b1c2d3e4-0002-0002-0002-000000000002", name: "Campaña Marketing Q4", description: "Lanzamiento de producto para fin de año." },
    ] as Project[],

    // Objectives
    objectives: [
        { id: "d1e2f3a4-0003-0003-0003-000000000001", title: "Desarrollar componentes UI", description: "Crear la librería de componentes en React.", type: "individual", assigned_to: "a1b2c3d4-e5f6-7890-1234-567890abcdef", project_id: "b1c2d3e4-0002-0002-0002-000000000001", is_incentivized: true, incentive_id: "a1b2c3d4-0001-0001-0001-000000000002", weight: 50, start_date: "2024-01-01", end_date: "2099-03-31" },
    ] as Objective[],

    // Tasks
    tasks: [
        { id: "e1f2a3b4-0004-0004-0004-000000000001", title: "Diseñar botón principal", objective_id: "d1e2f3a4-0003-0003-0003-000000000001", completed: true, is_incentivized: false },
        { id: "e1f2a3b4-0004-0004-0004-000000000002", title: "Crear componente Card", objective_id: "d1e2f3a4-0003-0003-0003-000000000001", completed: false, is_incentivized: false },
    ] as Task[],

    // Employees
    employees: [
        { id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", name: "Olivia Martin", email: "olivia.martin@example.com", department: "Ingeniería", role: "Desarrollador Frontend", status: "Activo", schedule: "9-5", avatar: "OM", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
        { id: "b2c3d4e5-f6a7-8901-2345-67890abcdef1", name: "Jackson Lee", email: "jackson.lee@example.com", department: "Diseño", role: "Diseñador UI/UX", status: "Activo", schedule: "10-6", avatar: "JL", workCenter: "Oficina Central", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
        { id: "c3d4e5f6-a7b8-9012-3456-7890abcdef2", name: "Isabella Nguyen", email: "isabella.nguyen@example.com", department: "Marketing", role: "Estratega de Contenido", status: "Activo", schedule: "9-5", avatar: "IN", workCenter: "Remoto", vacationManager: "Noah Brown", clockInManager: "Noah Brown", calendarId: "default-calendar", vacationPolicyId: "default" },
    ] as Employee[],

    // Settings
    centers: [
        { name: "Oficina Central", address: "123 Calle Principal, Anytown", radius: 100, lat: defaultMapCenter.lat, lng: defaultMapCenter.lng, timezone: 'Europe/Madrid' },
        { name: "Almacén Norte", address: "456 Avenida Industrial, Anytown", radius: 150, lat: defaultMapCenter.lat + 0.01, lng: defaultMapCenter.lng + 0.01, timezone: 'Europe/Madrid' },
    ] as Center[],
    departments: [
        { name: "Ingeniería" },
        { name: "Diseño" },
        { name: "Marketing" },
        { name: "Ventas" },
        { name: "RRHH" },
    ] as Department[],
    roles: [
        { name: "Propietario", description: "Control total sobre la cuenta.", permissions: allPermissions.map(p => p.id) },
        { name: "Administrador", description: "Acceso a todo excepto la gestión de roles.", permissions: allPermissions.filter(p => p.id !== 'manage_roles').map(p => p.id) },
        { name: "Recursos Humanos", description: "Gestiona personal, but no la configuración.", permissions: ['view_dashboard', 'manage_employees', 'manage_attendance', 'manage_absences', 'manage_performance', 'manage_documents'] },
        { name: "Manager", description: "Gestiona equipos o personas específicas.", permissions: ['view_dashboard', 'manage_attendance', 'manage_absences'] },
    ] as Role[],
    breaks: [
        { name: "Descanso de Comida", remunerated: false, limit: 60, isAutomatic: false, intervalStart: "13:00", intervalEnd: "15:00", notifyStart: true, notifyEnd: true, assignedTo: ["Turno de Mañana", "Turno de Tarde"] },
        { name: "Pausa para Café", remunerated: true, limit: 15, isAutomatic: false, intervalStart: "", intervalEnd: "", notifyStart: false, notifyEnd: false, assignedTo: ["Turno de Mañana", "Turno de Tarde", "Turno de Noche"] },
    ] as Break[],
    clockInTypes: [
        { name: "Reunión", color: "bg-blue-500", assignment: 'all', assignedTo: [] },
        { name: "Viaje de Trabajo", color: "bg-purple-500", assignment: 'all', assignedTo: [] },
    ] as ClockInType[],
    shifts: [
        { id: "1", name: "Turno de Mañana", start: "06:00", end: "14:00" },
        { id: "2", name: "Turno de Tarde", start: "14:00", end: "22:00" },
    ] as Shift[],
    flexibleSchedules: [] as FlexibleSchedule[],
    fixedSchedules: [] as FixedSchedule[],
    absenceTypes: [
        { id: 'telework', name: "Teletrabajo", color: "bg-blue-500", remunerated: true, unit: 'days', limitRequests: false, requestLimit: 0, blockPeriods: false, blockedPeriods: [], requiresApproval: true, allowAttachment: false, isDisabled: false, assignment: 'all', assignedTo: [] },
    ] as AbsenceType[],
    calendars: [
        { id: 'default-calendar', name: 'Calendario General', holidays: [] }
    ] as CalendarData[],
    vacationPolicies: [
        { id: 'default', name: 'General', unit: 'days', amount: 22, countBy: 'workdays', limitRequests: false, blockPeriods: false, blockedPeriods: [], assignment: 'all', assignedTo: [] }
    ] as VacationPolicy[],
};
