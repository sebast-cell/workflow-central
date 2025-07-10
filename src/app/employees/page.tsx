
'use client';

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, MoreHorizontal, PlusCircle, Search, UploadCloud, Link as LinkIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VariantProps } from "class-variance-authority";
import type { Employee, Department } from "@/lib/api";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, listSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    department: "",
    role: "",
    schedule: "",
    hireDate: format(new Date(), 'yyyy-MM-dd'),
    phone: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [employeesData, departmentsData] = await Promise.all([
        listEmployees(),
        listSettings<Department>('departments'),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudieron cargar los datos." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setSelectedEmployee(null);
    setFormData({ name: "", email: "", department: "", role: "", schedule: "", hireDate: format(new Date(), 'yyyy-MM-dd'), phone: "" });
    setIsDialogOpen(true);
  }

  const openEditDialog = (employee: Employee) => {
    setDialogMode('edit');
    setSelectedEmployee(employee);
    setFormData(employee);
    setIsDialogOpen(true);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (dialogMode === 'add') {
        const newEmployee = await createEmployee(formData as Omit<Employee, 'id' | 'status' | 'avatar'>);
        setEmployees(prev => [...prev, newEmployee]);
        toast({ title: "Empleado añadido", description: `${newEmployee.name} ha sido añadido al equipo.` });
      } else if (dialogMode === 'edit' && selectedEmployee) {
        const updated = await updateEmployee(selectedEmployee.id, formData);
        setEmployees(prev => prev.map(emp => (emp.id === selectedEmployee.id ? updated : emp)));
        toast({ title: "Empleado actualizado", description: `Los datos de ${updated.name} han sido guardados.` });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save employee:", error);
      toast({ variant: 'destructive', title: "Error", description: "No se pudo guardar el empleado." });
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === "Activo" ? "Deshabilitado" : "Activo";
    try {
        const updated = await fetch(`/api/employees/${employee.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        }).then(res => res.json());

        setEmployees(prev => prev.map(emp => (emp.id === employee.id ? updated : emp)));
        toast({ title: "Estado actualizado", description: `${employee.name} ahora está ${newStatus.toLowerCase()}.` });
    } catch (error) {
        console.error("Failed to toggle status:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo actualizar el estado." });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
        await deleteEmployee(employeeId);
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        toast({ title: "Empleado eliminado" });
    } catch (error) {
        console.error("Failed to delete employee:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar al empleado." });
    }
  };
  
  const getStatusBadgeVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
      switch (status) {
          case "Activo": return "active";
          case "Deshabilitado": return "secondary";
          case "De Licencia": return "warning";
          default: return "default";
      }
  }

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              employee.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || employee.department === departmentFilter;
        return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, departmentFilter]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h1>
        <p className="text-muted-foreground">Ver, gestionar y exportar datos de empleados.</p>
      </div>
      <Card className="bg-gradient-accent-to-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar empleados..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Deptos.</SelectItem>
                  {departments.map(dept => <SelectItem key={dept.name} value={dept.name}>{dept.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button onClick={openAddDialog} className="w-full sm:w-auto">
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
                <TableHead className="hidden lg:table-cell">Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
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
                  <TableCell className="hidden lg:table-cell">{employee.department}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.phone}</TableCell>
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
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(employee)}>
                            {employee.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEmployee(employee.id)}>
                            Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron empleados. ¡Añade el primero para empezar!
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'add' ? 'Añadir Nuevo Empleado' : 'Editar Empleado'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'add' ? 'Rellena los datos para añadir un nuevo miembro al equipo.' : `Editando el perfil de ${selectedEmployee?.name}.`}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="individual" className="w-full">
                {dialogMode === 'add' && (
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual">Individual</TabsTrigger>
                        <TabsTrigger value="multiple">Múltiple</TabsTrigger>
                    </TabsList>
                )}
                <TabsContent value="individual">
                    <form onSubmit={handleFormSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Ej. Juan Pérez" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="juan@ejemplo.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+34 600 000 000" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Departamento</Label>
                           <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                            <SelectTrigger id="department">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Cargo</Label>
                          <Input id="role" value={formData.role} onChange={handleInputChange} placeholder="Ej. Desarrollador Frontend" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hireDate">Fecha de Contratación</Label>
                          <Input id="hireDate" type="date" value={formData.hireDate} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule">Horario</Label>
                          <Input id="schedule" value={formData.schedule} onChange={handleInputChange} placeholder="Ej. 9-5, Fijo, Flexible" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{dialogMode === 'add' ? 'Añadir Empleado' : 'Guardar Cambios'}</Button>
                      </DialogFooter>
                    </form>
                </TabsContent>
                <TabsContent value="multiple">
                    <div className="py-4 space-y-4 text-center">
                        <p className="text-muted-foreground">Sube un archivo de Excel o envía un enlace de invitación para añadir múltiples empleados a la vez.</p>
                        <Button variant="outline"><UploadCloud className="mr-2 h-4 w-4" /> Subir Excel</Button>
                        <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" /> Enviar Invitaciones</Button>
                    </div>
                </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

    </div>
  )
}

    