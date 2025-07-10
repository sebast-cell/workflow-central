'use client';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/', // Use relative paths for Next.js API Routes
    headers: {
        'Content-Type': 'application/json',
    }
});


// -------- TYPE DEFINITIONS -------- //
export type AttendanceLog = {
    id: string;
    employeeId: string;
    employeeName: string; // denormalized for easier display
    department: string; // denormalized for easier display
    timestamp: string; // ISO 8601
    type: 'Entrada' | 'Salida' | 'Descanso';
    location: string;
    lat?: number;
    lng?: number;
    project?: string;
    task?: string;
}

export type Incentive = {
  id: string; // UUID
  name: string;
  type: 'económico' | 'días_libres' | 'formación' | 'otro';
  value: string;
  period: 'mensual' | 'trimestral' | 'anual';
  active: boolean;
  company_id: string; // UUID
  condition_expression?: {
    modality?: 'proportional' | 'all-or-nothing';
  };
};

export type Project = {
    id: string; // UUID
    name: string;
    description?: string;
};

export type Objective = {
  id: string; // UUID
  title: string;
  description?: string;
  type: 'individual' | 'equipo' | 'empresa';
  assigned_to: string; // UserID or TeamID or CompanyID
  project_id?: string; // UUID (nullable)
  is_incentivized: boolean;
  incentive_id?: string; // UUID (nullable)
  weight?: number; // decimal
  start_date: string; // date
  end_date: string; // date
};

export type Task = {
  id: string; // UUID
  title: string;
  objective_id: string; // UUID
  is_incentivized: boolean;
  incentive_id?: string; // UUID (nullable)
  completed: boolean;
};

export type Employee = {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    status: string;
    schedule: string;
    hireDate: string;
    phone: string;
    avatar: string;
};

export type Center = {
    id: string;
    name: string;
    address: string;
    radius: number;
    lat: number;
    lng: number;
    timezone: string;
};

export type Department = {
    id: string;
    name: string;
};

export type Role = {
    id: string;
    name: string;
    description: string;
    permissions: string[];
};

export type Break = {
    id: string;
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

export type ClockInType = {
    id: string;
    name: string;
    color: string;
    assignment: 'all' | 'specific';
    assignedTo: string[];
};

export type FlexibleSchedule = {
    id: string;
    name: string;
    workDays: string[];
    hoursPerDay: number;
    noWeeklyHours: boolean;
};

export type FixedScheduleRange = {
    id: string;
    start: string;
    end: string;
};

export type FixedSchedule = {
    id: string;
    name: string;
    workDays: string[];
    ranges: FixedScheduleRange[];
    isNightShift: boolean;
};

export type Shift = {
    id: string;
    name: string;
    start: string;
    end: string;
};

export type AbsenceType = {
    id: string;
    name: string;
    color: string;
    remunerated: boolean;
    unit: 'days' | 'hours';
    limitRequests?: boolean;
    requestLimit?: number;
    blockPeriods?: boolean;
    blockedPeriods?: { id: string; from: string; to: string }[];
    requiresApproval: boolean;
    allowAttachment: boolean;
    isDisabled: boolean;
    assignment: 'all' | 'specific';
    assignedTo: string[];
};

export type Holiday = {
    id: string;
    name: string;
    date: string; // ISO string for localStorage
};

export type CalendarData = {
    id: string;
    name: string;
    holidays: Holiday[];
};

export type VacationPolicy = {
    id: string;
    name: string;
    unit: 'days' | 'hours';
    amount: number;
    countBy: 'workdays' | 'natural';
    limitRequests: boolean;
    requestLimit?: number;
    blockPeriods: boolean;
    blockedPeriods: { id: string; from: string; to: string }[];
    assignment: 'all' | 'specific';
    assignedTo: string[];
};

// -------- HELPER FUNCTIONS -------- //
// A simple cache to avoid fetching the same data multiple times
const employeeCache = new Map<string, Employee>();
const departmentCache = new Map<string, Department>();

// Function to pre-fill caches
const populateCaches = async () => {
    if (employeeCache.size === 0) {
        const employees = await listEmployees();
        employees.forEach(e => employeeCache.set(e.id, e));
    }
    if (departmentCache.size === 0) {
        const departments = await listSettings<Department>('departments');
        departments.forEach(d => departmentCache.set(d.id, d));
    }
};

// This function resolves the name for an objective's assigned_to field
export const getAssignedToName = (objective: Objective): string => {
    if (objective.type === 'individual') {
        const employee = employeeCache.get(objective.assigned_to);
        return employee ? employee.name : "Empleado no encontrado";
    }
    if (objective.type === 'equipo') {
        const department = departmentCache.get(objective.assigned_to);
        return department ? department.name : "Equipo no encontrado";
    }
    if (objective.type === 'empresa') return "Toda la empresa";
    return "Desconocido";
};


// -------- API FUNCTIONS -------- //

// -- Attendance --
export const listAttendanceLogs = async (): Promise<AttendanceLog[]> => {
    const response = await apiClient.get('/api/attendance');
    return response.data;
};

export const createAttendanceLog = async (logData: Omit<AttendanceLog, 'id'>): Promise<AttendanceLog> => {
    const response = await apiClient.post('/api/attendance', logData);
    return response.data;
};


// -- Generic Settings Loader --
export const listSettings = async <T>(setting: string): Promise<T[]> => {
    const response = await apiClient.get(`/api/settings/${setting}`);
    return response.data;
};

export const createSetting = async <T extends {id?: string}>(setting: string, data: Omit<T, 'id'>): Promise<T> => {
    const response = await apiClient.post(`/api/settings/${setting}`, data);
    return response.data;
};

export const updateSetting = async <T>(setting:string, id: string, data: Partial<T>): Promise<T> => {
    const response = await apiClient.put(`/api/settings/${setting}/${id}`, data);
    return response.data;
}

export const deleteSetting = async (setting: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/settings/${setting}/${id}`);
}


// -- Employees --
export const listEmployees = async (): Promise<Employee[]> => {
    const response = await apiClient.get('/api/employees');
    return response.data;
};

export const createEmployee = async (employeeData: Omit<Employee, 'id' | 'status' | 'avatar'>): Promise<Employee> => {
    const response = await apiClient.post('/api/employees', employeeData);
    return response.data;
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put(`/api/employees/${id}`, employeeData);
    return response.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/employees/${id}`);
};

// -- Incentives --
export const listIncentives = async (): Promise<Incentive[]> => {
    const response = await apiClient.get('/api/incentives');
    return response.data;
};

export const createIncentive = async (incentive: Omit<Incentive, 'id' | 'company_id'>): Promise<Incentive> => {
    const response = await apiClient.post('/api/incentives', incentive);
    return response.data;
};

// -- Objectives --
export const listObjectives = async (): Promise<Objective[]> => {
    const response = await apiClient.get('/api/objectives');
    return response.data;
};

export const createObjective = async (objective: Omit<Objective, 'id'>): Promise<Objective> => {
    const response = await apiClient.post('/api/objectives', objective);
    return response.data;
};

export const calculateIncentiveForObjective = async (objectiveId: string): Promise<{ result: string | number; message: string; }> => {
    const response = await apiClient.get(`/api/objectives/${objectiveId}/incentive`);
    return response.data;
};

// -- Tasks --
export const listTasks = async (): Promise<Task[]> => {
    const response = await apiClient.get('/api/tasks');
    return response.data;
};

export const getTasksByObjective = async (objectiveId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/api/objectives/${objectiveId}/tasks`);
    return response.data;
};

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await apiClient.post('/api/tasks', task);
    return response.data;
};

// -- Projects --
export const listProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get('/api/projects');
    return response.data;
};

export const createProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post('/api/projects', projectData);
    return response.data;
};
