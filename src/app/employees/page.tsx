'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MoreHorizontal, PlusCircle, Search } from "lucide-react";

const initialEmployees = [
  { id: 1, name: "Olivia Martin", email: "olivia.martin@example.com", department: "Ingeniería", role: "Desarrollador Frontend", status: "Activo", schedule: "9-5", avatar: "OM" },
  { id: 2, name: "Jackson Lee", email: "jackson.lee@example.com", department: "Diseño", role: "Diseñador UI/UX", status: "Activo", schedule: "10-6", avatar: "JL" },
  { id: 3, name: "Isabella Nguyen", email: "isabella.nguyen@example.com", department: "Marketing", role: "Estratega de Contenido", status: "Activo", schedule: "9-5", avatar: "IN" },
  { id: 4, name: "William Kim", email: "will.kim@example.com", department: "Ingeniería", role: "Desarrollador Backend", status: "De Licencia", schedule: "9-5", avatar: "WK" },
  { id: 5, name: "Sophia Davis", email: "sophia.davis@example.com", department: "Ventas", role: "Ejecutivo de Cuentas", status: "Activo", schedule: "Flex", avatar: "SD" },
  { id: 6, name: "Liam Garcia", email: "liam.garcia@example.com", department: "RRHH", role: "Generalista de RRHH", status: "Activo", schedule: "8-4", avatar: "LG" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    schedule: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setNewEmployee((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email) return; 

    const newId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
    const avatar = newEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    setEmployees(prev => [...prev, {
      id: newId,
      ...newEmployee,
      status: "Activo",
      avatar: avatar,
    }]);

    setNewEmployee({ name: "", email: "", department: "", role: "", schedule: "" });
    setIsDialogOpen(false);
  };

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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Empleado
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-headline">Añadir Nuevo Empleado</DialogTitle>
                    <DialogDescription>
                      Rellena los datos para añadir un nuevo miembro al equipo.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEmployee}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nombre
                        </Label>
                        <Input id="name" value={newEmployee.name} onChange={handleInputChange} placeholder="Ej. Juan Pérez" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input id="email" type="email" value={newEmployee.email} onChange={handleInputChange} placeholder="juan@ejemplo.com" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">
                          Departamento
                        </Label>
                         <Select value={newEmployee.department} onValueChange={(value) => handleSelectChange('department', value)}>
                          <SelectTrigger id="department" className="col-span-3">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                            <SelectItem value="Diseño">Diseño</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Ventas">Ventas</SelectItem>
                            <SelectItem value="RRHH">RRHH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Rol
                        </Label>
                        <Input id="role" value={newEmployee.role} onChange={handleInputChange} placeholder="Ej. Desarrollador Frontend" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="schedule" className="text-right">
                          Horario
                        </Label>
                        <Input id="schedule" value={newEmployee.schedule} onChange={handleInputChange} placeholder="Ej. 9-5" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Añadir Empleado</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
