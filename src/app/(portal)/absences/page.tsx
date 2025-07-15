import { AbsenceCalendar } from './absence-calendar';
import { mockAbsences } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AbsencesPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Absence Management</h1>
        <p className="text-muted-foreground">View your time off and submit new requests.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Absence History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAbsences.map((absence) => (
                                <TableRow key={absence.id}>
                                    <TableCell>{absence.type}</TableCell>
                                    <TableCell>{absence.startDate.toLocaleDateString()}</TableCell>
                                    <TableCell>{absence.endDate.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Badge variant={getStatusVariant(absence.status)}>{absence.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            <AbsenceCalendar absenceDates={mockAbsences} />
        </div>
      </div>
    </div>
  );
}
