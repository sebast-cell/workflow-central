import type { User } from '@/lib/types';

export const mockUsers: User[] = [
  {
    uid: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    department: 'Management',
    status: 'Active',
    hireDate: '2022-01-15',
    photoURL: `https://i.pravatar.cc/150?u=admin@example.com`,
  },
  {
    uid: '2',
    name: 'Employee One',
    email: 'employee1@example.com',
    role: 'Employee',
    department: 'Sales',
    status: 'Active',
    hireDate: '2023-03-20',
    photoURL: `https://i.pravatar.cc/150?u=employee1@example.com`,
  },
  {
    uid: '3',
    name: 'Employee Two',
    email: 'employee2@example.com',
    role: 'Employee',
    department: 'Engineering',
    status: 'Active',
    hireDate: '2023-05-10',
    photoURL: `https://i.pravatar.cc/150?u=employee2@example.com`,
  },
  {
    uid: '4',
    name: 'Inactive User',
    email: 'inactive@example.com',
    role: 'Employee',
    department: 'Marketing',
    status: 'Inactive',
    hireDate: '2022-11-01',
    photoURL: `https://i.pravatar.cc/150?u=inactive@example.com`,
  },
];

export const mockAttendance = [
  {
    id: 'att1',
    employeeName: 'Employee One',
    date: '2024-07-29',
    clockIn: '09:05 AM',
    clockOut: '05:30 PM',
    totalHours: '8h 25m',
  },
  {
    id: 'att2',
    employeeName: 'Employee Two',
    date: '2024-07-29',
    clockIn: '08:58 AM',
    clockOut: '05:02 PM',
    totalHours: '8h 4m',
  },
  {
    id: 'att3',
    employeeName: 'Admin User',
    date: '2024-07-29',
    clockIn: '09:15 AM',
    clockOut: '06:00 PM',
    totalHours: '8h 45m',
  },
];

export const mockAbsences = [
    {
        id: "abs1",
        employeeId: "2",
        employeeName: "Employee One",
        type: "Sick Leave",
        startDate: new Date("2024-07-22"),
        endDate: new Date("2024-07-22"),
        status: "Approved",
    },
    {
        id: "abs2",
        employeeId: "3",
        employeeName: "Employee Two",
        type: "Vacation",
        startDate: new Date("2024-08-05"),
        endDate: new Date("2024-08-09"),
        status: "Pending",
    },
];

export const mockTasks = [
    { id: "task1", title: "Update Q3 sales deck", status: "In Progress", dueDate: "2024-08-15" },
    { id: "task2", title: "Develop new feature for portal", status: "Not Started", dueDate: "2024-09-01" },
    { id: "task3", title: "Review performance metrics", status: "Completed", dueDate: "2024-07-28" },
]
