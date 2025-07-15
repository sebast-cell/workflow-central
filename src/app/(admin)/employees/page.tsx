import { mockUsers } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';

export default async function EmployeesPage() {
  const data = mockUsers;

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
