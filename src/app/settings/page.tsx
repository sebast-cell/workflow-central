import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de la cuenta y de la organización.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
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
