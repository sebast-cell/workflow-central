'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, PlusCircle } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de la cuenta y de la organización.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="centers">Centros de Trabajo</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
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
                    <DialogHeader>
                        <DialogTitle className="font-headline">Nuevo Centro de Trabajo</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="center-name">Nombre del Centro</Label>
                            <Input id="center-name" placeholder="Ej. Oficina Principal"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="center-address">Dirección</Label>
                            <Input id="center-address" placeholder="Ej. 123 Calle Falsa"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="center-radius">Radio de Geolocalización (metros)</Label>
                            <Input id="center-radius" type="number" placeholder="Ej. 100"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button>Guardar Centro</Button>
                    </DialogFooter>
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
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Departamentos</CardTitle>
                <CardDescription>Organiza a tus empleados en diferentes departamentos.</CardDescription>
              </div>
               <Dialog>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Añadir Depto.</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Nuevo Departamento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="dept-name">Nombre del Departamento</Label>
                            <Input id="dept-name" placeholder="Ej. Soporte Técnico"/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button>Guardar</Button>
                    </DialogFooter>
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
              <Button>Cambiar Contraseña</Button>
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
                <CardHeader>
                  <CardTitle className="text-lg">Slack</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Recibe notificaciones en Slack.</p>
                  <Button className="w-full">Conectar</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Google Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Sincroniza ausencias y horarios.</p>
                   <Button className="w-full">Conectar</Button>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg">QuickBooks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Sincroniza datos de nómina.</p>
                   <Button className="w-full" variant="secondary" disabled>Conectado</Button>
                </CardContent>
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
