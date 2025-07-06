'use client';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    }
});


// -------- TYPE DEFINITIONS -------- //
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

// These types are not in the API but used across the frontend
export type Employee = {
    id: string; // UUID
    name: string;
    email: string;
};

export type Department = {
    id: string; // UUID
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

export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post('/api/projects', project);
    return response.data;
};
