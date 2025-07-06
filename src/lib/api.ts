'use client';
// A file for client-side API calls to the FastAPI backend.

const API_BASE_URL = 'http://localhost:8000';

// -------- TYPE DEFINITIONS -------- //
export type Incentive = {
  id: string; // UUID
  name: string;
  type: 'económico' | 'días_libres' | 'formación' | 'otro';
  value: string;
  period: 'mensual' | 'trimestral' | 'anual';
  active: boolean;
  company_id: string; // UUID
  condition_expression?: object;
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
  assigned_to: string; // UserID or TeamID
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

// These types are not in the API but used across the frontend
export type Employee = {
    id: string; // UUID
    name: string;
    email: string;
};

export type Department = {
    name: string;
};

// Not in API, but used in components
export type Center = {
    name: string;
    address: string;
    radius: number;
    lat: number;
    lng: number;
    timezone: string;
};

export type Role = {
    name: string;
    description: string;
    permissions: string[];
};

export type Break = {
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

// -------- API FUNCTIONS -------- //

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
    }
    return response.json();
}

// -- Incentives --
export const listIncentives = async (): Promise<Incentive[]> => {
    const response = await fetch(`${API_BASE_URL}/incentives/`);
    return handleResponse<Incentive[]>(response);
};

export const createIncentive = async (incentive: Incentive): Promise<Incentive> => {
    const response = await fetch(`${API_BASE_URL}/incentives/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incentive),
    });
    return handleResponse<Incentive>(response);
};

// -- Objectives --
export const listObjectives = async (): Promise<Objective[]> => {
    const response = await fetch(`${API_BASE_URL}/objectives/`);
    return handleResponse<Objective[]>(response);
};

export const createObjective = async (objective: Objective): Promise<Objective> => {
    const response = await fetch(`${API_BASE_URL}/objectives/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objective),
    });
    return handleResponse<Objective>(response);
};

export const calculateIncentiveForObjective = async (objectiveId: string): Promise<{ result: string | number; message: string; }> => {
    const response = await fetch(`${API_BASE_URL}/objectives/${objectiveId}/incentive`);
    return handleResponse<{ result: string | number; message: string; }>(response);
};

// -- Tasks --
export const listTasks = async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/`);
    return handleResponse<Task[]>(response);
};

export const getTasksByObjective = async (objectiveId: string): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/objectives/${objectiveId}/tasks`);
    return handleResponse<Task[]>(response);
};

export const createTask = async (task: Task): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
};

// -- Projects --
export const listProjects = async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/projects/`);
    return handleResponse<Project[]>(response);
};

export const createProject = async (project: Project): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
    });
    return handleResponse<Project>(response);
};
