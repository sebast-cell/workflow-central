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
  { id: 1, name: "Olivia Martin", email: "olivia.martin@example.com", department: "Ingeniería", role: "Desarrollador Frontend", status: "Activo", schedule: "9-5", avatar: "OM" },
  { id: 2, name: "Jackson Lee", email: "jackson.lee@example.com", department: "Diseño", role: "Diseñador UI/UX", status: "Activo", schedule: "10-6", avatar: "JL" },
  { id: 3, name: "Isabella Nguyen", email: "isabella.nguyen@example.com", department: "Marketing", role: "Estratega de Contenido", status: "Activo", schedule: "9-5", avatar: "IN" },
  { id: 4, name: "William Kim", email: "will.kim@example.com", department: "Ingeniería", role: "Desarrollador Backend", status: "De Licencia", schedule: "9-5", avatar: "WK" },
  { id: 5, name: "Sophia Davis", email: "sophia.davis@example.com", department: "Ventas", role: "Ejecutivo de Cuentas", status: "Activo", schedule: "Flex", avatar: "SD" },
  { id: 6, name: "Liam Garcia", email: "liam.garcia@example.com", department: "RRHH", role: "Generalista de RRHH", status: "Activo", schedule: "8-4", avatar: "LG" },
];

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Gestión de Empleados</h1>
        <p className="text-muted-foreground">Ver, gestionar y exportar datos de empleados.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar empleados..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Ingeniería</SelectItem>
                  <SelectItem value="design">Diseño</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="hr">RRHH</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Empleado
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Horario</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
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
                    <Badge variant={employee.status === 'Activo' ? 'secondary' : 'outline'} className={employee.status === 'Activo' ? "bg-green-100 text-green-800" : ""}>
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
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Desactivar</DropdownMenuItem>
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
