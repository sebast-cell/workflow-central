import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function EmployeeSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y tus preferencias.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Preferencias de Notificaciones</CardTitle>
            <CardDescription>Elige cómo quieres que te notifiquemos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Notificaciones por Email</h3>
                    <p className="text-sm text-muted-foreground">Recibe emails sobre aprobaciones y actualizaciones.</p>
                </div>
                <Switch defaultChecked aria-label="Toggle email notifications" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Notificaciones Push</h3>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones push en tus dispositivos.</p>
                </div>
                <Switch aria-label="Toggle push notifications" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h3 className="font-semibold">Recordatorios de Calendario</h3>
                    <p className="text-sm text-muted-foreground">Recibe recordatorios de tus próximas ausencias.</p>
                </div>
                <Switch defaultChecked aria-label="Toggle calendar reminders" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Seguridad de la Cuenta</CardTitle>
            <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input id="currentPassword" type="password" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input id="newPassword" type="password" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input id="confirmPassword" type="password" />
            </div>
            <Button className="w-full">Actualizar Contraseña</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
