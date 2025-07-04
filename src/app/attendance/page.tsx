import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Coffee, Globe, Home, UserCheck, UserX } from "lucide-react";

const attendanceLog = [
  { time: "09:01 AM", employee: "Olivia Martin", status: "Clocked In", location: "Office" },
  { time: "09:03 AM", employee: "Jackson Lee", status: "Clocked In", location: "Remote" },
  { time: "11:30 AM", employee: "Isabella Nguyen", status: "On Break", location: "Office" },
  { time: "12:15 PM", employee: "Isabella Nguyen", status: "Clocked In", location: "Office" },
  { time: "02:00 PM", employee: "William Kim", status: "Clocked In", location: "Office" },
  { time: "05:05 PM", employee: "Olivia Martin", status: "Clocked Out", location: "Office" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Time & Attendance</h1>
        <p className="text-muted-foreground">Monitor daily clock-ins, status, and timelines.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Office</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Remotely</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Break</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Vacation</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Attendance Timeline</CardTitle>
          <CardDescription>A real-time log of today's clock-in events.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Select>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.employee}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        log.status === "Clocked In" ? "border-green-500 text-green-700" :
                        log.status === "Clocked Out" ? "border-red-500 text-red-700" :
                        "border-yellow-500 text-yellow-700"
                      }
                    >{log.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{log.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
