
'use client';

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EmployeesPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add');
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
            listSettings<Department>('departments')
        ]);
        setEmployees(employeesData);
        setDepartments(departmentsData);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al cargar datos",
            description: "No se pudieron obtener los empleados o departamentos.",
        });
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

  const openAddSheet = () => {
    setSheetMode('add');
    setSelectedEmployee(null);
    setFormData({ name: "", email: "", department: "", role: "", schedule: "", hireDate: format(new Date(), 'yyyy-MM-dd'), phone: "" });
    setIsSheetOpen(true);
  }

  const openEditSheet = (employee: Employee) => {
    setSheetMode('edit');
    setSelectedEmployee(employee);
    setFormData(employee);
    setIsSheetOpen(true);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
        if (sheetMode === 'add') {
            const newEmployeeData = {
                name: formData.name,
                email: formData.email,
                department: formData.department || '',
                role: formData.role || '',
                schedule: formData.schedule || '',
                hireDate: formData.hireDate ? format(parseISO(formData.hireDate), 'yyyy-MM-dd') : '',
                phone: formData.phone || '',
            };
            await createEmployee(newEmployeeData);
            toast({ title: "Empleado añadido", description: `${newEmployeeData.name} ha sido añadido al equipo.` });
        } else if (sheetMode === 'edit' && selectedEmployee) {
            await updateEmployee(selectedEmployee.id, formData);
            toast({ title: "Empleado actualizado", description: `Los datos de ${formData.name} han sido guardados.` });
        }
        await fetchData(); // Refresh data from server
        setIsSheetOpen(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Error al guardar", description: "No se pudo guardar el empleado." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus = employee.status === "Activo" ? "Deshabilitado" : "Activo";
    try {
        await updateEmployee(employee.id, { status: newStatus });
        await fetchData();
        toast({ title: "Estado actualizado", description: `${employee.name} ahora está ${newStatus.toLowerCase()}.` });
    } catch (error) {
        toast({ variant: "destructive", title: "Error al actualizar", description: "No se pudo cambiar el estado del empleado." });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
        await deleteEmployee(employeeId);
        await fetchData();
        toast({ title: "Empleado eliminado" });
    } catch (error) {
        toast({ variant: "destructive", title: "Error al eliminar", description: "No se pudo eliminar al empleado." });
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
    return employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              employee.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || employee.department === departmentFilter;
        return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, departmentFilter]);
  
  if (isLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/3" />
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Skeleton className="h-10 flex-1 w-full" />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Skeleton className="h-10 w-full sm:w-[180px]" />
                            <Skeleton className="h-10 w-full sm:w-auto px-6" />
                            <Skeleton className="h-10 w-full sm:w-auto px-6" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
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
                  {departments.map(dept => <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button onClick={openAddSheet} className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Añadir Empleado
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-md flex flex-col">
                    <SheetHeader>
                      <SheetTitle>
                        {sheetMode === 'add' ? 'Añadir Nuevo Empleado' : 'Editar Empleado'}
                      </SheetTitle>
                      <SheetDescription>
                        {sheetMode === 'add' ? 'Rellena los datos para añadir un nuevo miembro al equipo.' : `Editando el perfil de ${selectedEmployee?.name}.`}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-grow overflow-y-auto">
                      <ScrollArea className="h-full pr-6">
                        <Tabs defaultValue="individual" className="w-full pt-4">
                            {sheetMode === 'add' && (
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="individual">Individual</TabsTrigger>
                                    <TabsTrigger value="multiple">Múltiple</TabsTrigger>
                                </TabsList>
                            )}
                            <TabsContent value="individual">
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Ej. Juan Pérez" required />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="juan@ejemplo.com" required />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} placeholder="+34 600 000 000" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="department">Departamento</Label>
                                    <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                                      <SelectTrigger id="department">
                                        <SelectValue placeholder="Seleccionar" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="role">Cargo</Label>
                                    <Input id="role" value={formData.role || ''} onChange={handleInputChange} placeholder="Ej. Desarrollador Frontend" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="hireDate">Fecha de Contratación</Label>
                                    <Input id="hireDate" type="date" value={formData.hireDate || ''} onChange={handleInputChange} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="schedule">Horario</Label>
                                    <Input id="schedule" value={formData.schedule || ''} onChange={handleInputChange} placeholder="Ej. 9-5, Fijo, Flexible" />
                                  </div>
                                  <SheetFooter className="pt-4">
                                    <Button type="submit" disabled={isSubmitting}>
                                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      {sheetMode === 'add' ? 'Añadir Empleado' : 'Guardar Cambios'}
                                    </Button>
                                  </SheetFooter>
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
                      </ScrollArea>
                    </div>
                  </SheetContent>
              </Sheet>
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
                        <DropdownMenuItem onClick={() => openEditSheet(employee)}>Editar</DropdownMenuItem>
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
    </div>
  )
}
