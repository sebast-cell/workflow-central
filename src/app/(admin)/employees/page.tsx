import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { columns } from './columns';
import { DataTable } from './data-table';
import type { User } from '@/lib/types';
import { AddEmployeeSheet } from './add-employee-sheet';

async function getEmployees(): Promise<User[]> {
  const querySnapshot = await getDocs(collection(db, 'employees'));
  const employees = querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[];
  return employees;
}

export default async function EmployeesPage() {
  const data = await getEmployees();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Employees</h1>
        <p className="text-muted-foreground">Manage all employee records and information.</p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
