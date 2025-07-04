
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CalendarClock, Briefcase, UserPlus, SlidersHorizontal, Sun, Moon, Coffee, Timer, CalendarDays, Plane, Bell, Bot, Lock, Puzzle, List, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const [centers, setCenters] = useState([
    { name: "Oficina Central", address: "123 Calle Principal, Anytown", radius: 100 },
    { name: "Almacén Norte", address: "456 Avenida Industrial, Anytown", radius: 150 },
  ]);
  const [departments, setDepartments] = useState([
    { name: "Ingeniería" },
    { name: "Diseño" },
    { name: "Marketing" },
    { name: "Ventas" },
    { name: "RRHH" },
  ]);

  const [roles, setRoles] = useState([
    { name: "Propietario", description: "Control total sobre la cuenta." },
    { name: "Administrador", description: "Acceso a todo excepto la gestión de roles." },
    { name: "Recursos Humanos", description: "Gestiona personal, but no la configuración." },
    { name: "Manager", description: "Gestiona equipos o personas específicas." },
  ]);

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [dialogRoleMode, setDialogRoleMode] = useState<'add' | 'edit'>('add');
  const [selectedRole, setSelectedRole] = useState<{ name: string, description: string } | null>(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '' });

  const absenceTypes = [
    { name: "Vacaciones", remunerated: true, limit: "Anual" },
    { name: "Licencia por enfermedad", remunerated: true, limit: "Sin límite" },
    { name: "Teletrabajo", remunerated: true, limit: "Sin límite" },
  ];

  const shifts = [
    { name: "Turno de Mañana", start: "06:00", end: "14:00" },
    { name: "Turno de Tarde", start: "14:00", end: "22:00" },
    { name: "Turno de Noche", start: "22:00", end: "06:00" },
  ];

  const openAddRoleDialog = () => {
    setDialogRoleMode('add');
    setSelectedRole(null);
    setRoleFormData({ name: '', description: '' });
    setIsRoleDialogOpen(true);
  };

  const openEditRoleDialog = (role: { name: string, description: string }) => {
    setDialogRoleMode('edit');
    setSelectedRole(role);
    setRoleFormData({ name: role.name, description: role.description });
    setIsRoleDialogOpen(true);
  };

  const handleRoleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name) return;

    if (dialogRoleMode === 'add') {
      setRoles(prev => [...prev, roleFormData]);
    } else if (dialogRoleMode === 'edit' && selectedRole) {
      setRoles(prev => prev.map(r => (r.name === selectedRole.name ? roleFormData : r)));
    }
    setIsRoleDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de la cuenta y de la organización.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4" orientation="vertical">
        <TabsList className="w-full md:w-48 h-auto flex-col items-start">
          <TabsTrigger value="general" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4"/>General</TabsTrigger>
          <TabsTrigger value="roles" className="w-full justify-start"><ShieldCheck className="mr-2 h-4 w-4"/>Roles</TabsTrigger>
          <TabsTrigger value="centers" className="w-full justify-start"><UserPlus className="mr-2 h-4 w-4"/>Centros y Deptos.</TabsTrigger>
          <Separator className="my-2"/>
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">TIEMPO</p>
          <TabsTrigger value="schedules" className="w-full justify-start"><CalendarClock className="mr-2 h-4 w-4"/>Horarios</TabsTrigger>
          <TabsTrigger value="breaks" className="w-full justify-start"><Coffee className="mr-2 h-4 w-4"/>Descansos</TabsTrigger>
          <TabsTrigger value="checkin-types" className="w-full justify-start"><SlidersHorizontal className="mr-2 h-4 w-4"/>Tipos de Fichaje</TabsTrigger>
          <TabsTrigger value="calendars" className="w-full justify-start"><CalendarDays className="mr-2 h-4 w-4"/>Calendarios</TabsTrigger>
          <TabsTrigger value="vacations" className="w-full justify-start"><Plane className="mr-2 h-4 w-4"/>Vacaciones</TabsTrigger>
          <TabsTrigger value="absences" className="w-full justify-start"><Plane className="mr-2 h-4 w-4"/>Ausencias</TabsTrigger>
          <Separator className="my-2"/>
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">CUENTA</p>
          <TabsTrigger value="automations" className="w-full justify-start"><Bot className="mr-2 h-4 w-4"/>Automatizaciones</TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start"><Bell className="mr-2 h-4 w-4"/>Notificaciones</TabsTrigger>
          <TabsTrigger value="permissions" className="w-full justify-start"><Lock className="mr-2 h-4 w-4"/>Permisos</TabsTrigger>
          <TabsTrigger value="integrations" className="w-full justify-start"><Puzzle className="mr-2 h-4 w-4"/>Integraciones</TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start"><Lock className="mr-2 h-4 w-4"/>Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Detalles de la Empresa</CardTitle>
              <CardDescription>Actualiza la información de tu organización.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input id="companyName" defaultValue="WorkFlow Central" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogo">Logo de la Empresa</Label>
                <Input id="companyLogo" type="file" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Roles de Usuario</CardTitle>
                <CardDescription>Indica qué usuarios tendrán más visibilidad o control.</CardDescription>
              </div>
               <Button onClick={openAddRoleDialog}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Rol</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.map((role, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEditRoleDialog(role)}>Editar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline">
                  {dialogRoleMode === 'add' ? 'Añadir Nuevo Rol' : 'Editar Rol'}
                </DialogTitle>
                <DialogDescription>
                  {dialogRoleMode === 'add' ? 'Define un nuevo rol y su descripción.' : `Editando el rol de ${selectedRole?.name}.`}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRoleFormSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Nombre del Rol</Label>
                    <Input 
                      id="role-name" 
                      value={roleFormData.name} 
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))} 
                      placeholder="Ej. Manager de Proyecto" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Descripción</Label>
                    <Textarea 
                      id="role-description" 
                      value={roleFormData.description} 
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))} 
                      placeholder="Describe los permisos y responsabilidades de este rol." 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{dialogRoleMode === 'add' ? 'Añadir Rol' : 'Guardar Cambios'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Centros de Trabajo</CardTitle>
                <CardDescription>Configura las ubicaciones de tu empresa para fichajes con geolocalización.</CardDescription>
              </div>
               <Dialog>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Centro</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-headline">Nuevo Centro de Trabajo</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="center-name">Nombre del Centro</Label><Input id="center-name" placeholder="Ej. Oficina Principal"/></div>
                        <div className="space-y-2"><Label htmlFor="center-address">Dirección</Label><Input id="center-address" placeholder="Ej. 123 Calle Falsa"/></div>
                        <div className="space-y-2"><Label htmlFor="center-radius">Radio de Geolocalización (metros)</Label><Input id="center-radius" type="number" placeholder="Ej. 100"/></div>
                    </div>
                    <DialogFooter><Button>Guardar Centro</Button></DialogFooter>
                </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {centers.map((center, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{center.name}</h3>
                    <p className="text-sm text-muted-foreground">{center.address} (Radio: {center.radius}m)</p>
                  </div>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Departamentos</CardTitle>
                <CardDescription>Organiza a tus empleados en diferentes departamentos.</CardDescription>
              </div>
               <Dialog>
                <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Depto.</Button></DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader><DialogTitle className="font-headline">Nuevo Departamento</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="dept-name">Nombre del Departamento</Label><Input id="dept-name" placeholder="Ej. Soporte Técnico"/></div>
                    </div>
                    <DialogFooter><Button>Guardar</Button></DialogFooter>
                </DialogContent>
               </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <h3 className="font-semibold">{dept.name}</h3>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tipos de Horario</CardTitle>
              <CardDescription>Configura los diferentes tipos de horarios que los empleados pueden tener.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Flexible</h3>
                  <p className="text-sm text-muted-foreground">Se establecen días laborables y un total de horas a cumplir.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">Configurar Horario Flexible</DialogTitle>
                      <DialogDescription>Establece los días laborables y el total de horas a cumplir.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="weekly-hours">Total de horas semanales</Label>
                        <Input id="weekly-hours" type="number" defaultValue="40" />
                      </div>
                      <div className="space-y-2">
                        <Label>Días laborables</Label>
                        <div className="flex gap-4 flex-wrap pt-2">
                          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={day} className="flex items-center gap-1.5">
                              <Checkbox id={`day-${i}`} defaultChecked={i < 5} />
                              <Label htmlFor={`day-${i}`} className="font-normal">{day}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Guardar Cambios</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Fijo</h3>
                  <p className="text-sm text-muted-foreground">Se establecen horas de entrada y salida fijas.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">Configurar Horario Fijo</DialogTitle>
                      <DialogDescription>Establece las horas de entrada y salida fijas para la jornada.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Hora de Entrada</Label>
                          <Input id="start-time" type="time" defaultValue="09:00" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time">Hora de Salida</Label>
                          <Input id="end-time" type="time" defaultValue="17:00" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="split-shift" />
                        <Label htmlFor="split-shift" className="font-normal">Habilitar jornada partida</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Días laborables</Label>
                        <div className="flex gap-4 flex-wrap pt-2">
                          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={day} className="flex items-center gap-1.5">
                              <Checkbox id={`day-fixed-${i}`} defaultChecked={i < 5} />
                              <Label htmlFor={`day-fixed-${i}`} className="font-normal">{day}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>Guardar Cambios</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Turnos</h3>
                  <p className="text-sm text-muted-foreground">Para horarios rotativos y cambiantes.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configurar</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-headline">Gestionar Turnos</DialogTitle>
                      <DialogDescription>Crea y edita los diferentes turnos para horarios rotativos. Esta es una vista previa, la asignación se realiza en otra sección.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                      {shifts.map((shift, index) => (
                        <div key={index} className="flex items-end gap-2 p-3 border rounded-md bg-muted/50">
                          <div className="flex-1 space-y-2">
                            <Label htmlFor={`shift-name-${index}`}>Nombre del Turno</Label>
                            <Input id={`shift-name-${index}`} defaultValue={shift.name} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`shift-start-${index}`}>Inicio</Label>
                            <Input id={`shift-start-${index}`} type="time" defaultValue={shift.start} className="w-28"/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`shift-end-${index}`}>Fin</Label>
                            <Input id={`shift-end-${index}`} type="time" defaultValue={shift.end} className="w-28"/>
                          </div>
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4"/> Añadir Nuevo Turno</Button>
                    </div>
                    <DialogFooter>
                      <Button>Guardar Cambios</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="breaks" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Gestión de Descansos</CardTitle>
                    <CardDescription>Configura los descansos, ya sean remunerados o no.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-semibold">Descanso de Comida</h3>
                            <p className="text-sm text-muted-foreground">No remunerado, 60 minutos.</p>
                        </div>
                        <Button variant="ghost">Editar</Button>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-semibold">Pausa para Café</h3>
                            <p className="text-sm text-muted-foreground">Remunerado, 15 minutos.</p>
                        </div>
                        <Button variant="ghost">Editar</Button>
                    </div>
                     <Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Descanso</Button>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="vacations" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Configuración de Vacaciones</CardTitle>
                    <CardDescription>Establece las políticas de vacaciones para la empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="default-vacation-days">Días de vacaciones por defecto al año</Label>
                        <Input id="default-vacation-days" type="number" defaultValue="22" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="block-periods" />
                        <Label htmlFor="block-periods">Bloquear periodos específicos para solicitudes de vacaciones</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="natural-days" />
                        <Label htmlFor="natural-days">Contar vacaciones como días naturales en lugar de laborables</Label>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="absences" className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Tipos de Ausencia</CardTitle>
                        <CardDescription>Crea y configura diferentes tipos de permisos y ausencias.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Tipo</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {absenceTypes.map((absence, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h3 className="font-semibold">{absence.name}</h3>
                                <p className="text-sm text-muted-foreground">Remunerado: {absence.remunerated ? 'Sí' : 'No'} | Límite: {absence.limit}</p>
                            </div>
                            <Button variant="ghost">Editar</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="automations" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Automatizaciones de Jornada</CardTitle>
                    <CardDescription>Configura acciones automáticas para los fichajes de los empleados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-semibold">Cierre Automático al Cumplir Horario</h3>
                            <p className="text-sm text-muted-foreground">Cierra el fichaje cuando el empleado completa su jornada.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <h3 className="font-semibold">Cierre Automático por Olvido</h3>
                            <p className="text-sm text-muted-foreground">Establece una hora tope para cerrar fichajes abiertos.</p>
                        </div>
                         <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Permisos de Empleado</CardTitle>
                    <CardDescription>Restringe la visibilidad de ciertas secciones para los empleados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <h3 className="font-semibold">Ver "Husin" y "Timeline"</h3>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <h3 className="font-semibold">Ver calendario de ausencias del equipo</h3>
                        <Switch defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <h3 className="font-semibold">Editar su propio perfil</h3>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Autenticación</CardTitle>
              <CardDescription>Gestiona la configuración de seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta.</p>
                </div>
                <Switch aria-label="Toggle Two-Factor Authentication" />
              </div>
              <Button>Cambiar Contraseña Maestra</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Integraciones de Aplicaciones</CardTitle>
              <CardDescription>Conecta WorkFlow Central con tus herramientas favoritas.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Slack</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground mb-4">Recibe notificaciones en Slack.</p><Button className="w-full">Conectar</Button></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Google Calendar</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground mb-4">Sincroniza ausencias y horarios.</p><Button className="w-full">Conectar</Button></CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle className="text-lg">QuickBooks</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground mb-4">Sincroniza datos de nómina.</p><Button className="w-full" variant="secondary" disabled>Conectado</Button></CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Preferencias de Notificaciones</CardTitle>
              <CardDescription>Gestiona cómo recibes las notificaciones como administrador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Nuevas Solicitudes de Ausencia</h3>
                  <p className="text-sm text-muted-foreground">Notificar por email cuando un empleado solicite tiempo libre.</p>
                </div>
                <Switch defaultChecked aria-label="Toggle absence request notifications" />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Alertas de Finalización de Proyecto</h3>
                  <p className="text-sm text-muted-foreground">Recibir un email cuando un proyecto se marque como completado.</p>
                </div>
                <Switch defaultChecked aria-label="Toggle project completion notifications" />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Resumen Semanal de Actividad</h3>
                   <p className="text-sm text-muted-foreground">Enviar un resumen de la actividad del equipo cada lunes.</p>
                </div>
                <Switch aria-label="Toggle weekly summary notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

    