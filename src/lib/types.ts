export type User = {
  uid: string;
  email: string | null;
  name: string | null;
  role: 'Admin' | 'Employee' | 'Owner';
  department: string | null;
  status: 'Active' | 'Inactive';
  hireDate: string | null;
  photoURL?: string | null;
};
