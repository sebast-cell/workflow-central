import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MoreHorizontal, PlusCircle, Search } from "lucide-react";

const employees = [
  { id: 1, name: "Olivia Martin", email: "olivia.martin@example.com", department: "Engineering", role: "Frontend Developer", status: "Active", schedule: "9-5", avatar: "OM" },
  { id: 2, name: "Jackson Lee", email: "jackson.lee@example.com", department: "Design", role: "UI/UX Designer", status: "Active", schedule: "10-6", avatar: "JL" },
  { id: 3, name: "Isabella Nguyen", email: "isabella.nguyen@example.com", department: "Marketing", role: "Content Strategist", status: "Active", schedule: "9-5", avatar: "IN" },
  { id: 4, name: "William Kim", email: "will.kim@example.com", department: "Engineering", role: "Backend Developer", status: "On Leave", schedule: "9-5", avatar: "WK" },
  { id: 5, name: "Sophia Davis", email: "sophia.davis@example.com", department: "Sales", role: "Account Executive", status: "Active", schedule: "Flex", avatar: "SD" },
  { id: 6, name: "Liam Garcia", email: "liam.garcia@example.com", department: "HR", role: "HR Generalist", status: "Active", schedule: "8-4", avatar: "LG" },
];

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Management</h1>
        <p className="text-muted-foreground">View, manage, and export employee data.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Schedule</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="people avatar" alt={employee.name} />
                        <AvatarFallback>{employee.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'Active' ? 'secondary' : 'outline'} className={employee.status === 'Active' ? "bg-green-100 text-green-800" : ""}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.schedule}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
