import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle } from "lucide-react";

const requests = [
  { employee: "Liam Johnson", type: "Vacation", dates: "Aug 19 - Aug 23, 2024", status: "Approved" },
  { employee: "Emma Wilson", type: "Sick Leave", dates: "Aug 12, 2024", status: "Approved" },
  { employee: "Noah Brown", type: "Vacation", dates: "Sep 02 - Sep 06, 2024", status: "Pending" },
  { employee: "Ava Smith", type: "Personal Day", dates: "Aug 15, 2024", status: "Rejected" },
];

export default function AbsencesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Absences & PTO</h1>
        <p className="text-muted-foreground">Manage employee vacation, sick leave, and other absences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Team Absence Calendar</CardTitle>
              <CardDescription>Monthly view of all team absences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border w-full"
                numberOfMonths={1}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="vacations" defaultChecked/>
                <label htmlFor="vacations" className="text-sm font-medium leading-none">Vacations</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="absences" defaultChecked/>
                <label htmlFor="absences" className="text-sm font-medium leading-none">Absences</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="holidays" />
                <label htmlFor="holidays" className="text-sm font-medium leading-none">Holidays</label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Assign Absence
                </Button>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Pending & Recent Requests</CardTitle>
          <CardDescription>Review and manage absence requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{request.employee}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.dates}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        request.status === "Approved" ? "bg-green-100 text-green-800" :
                        request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }
                      variant="secondary"
                    >{request.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
