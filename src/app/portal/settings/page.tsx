import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">En Construcción</CardTitle>
            <CardDescription>Esta sección está actualmente en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aquí podrás cambiar tu contraseña, gestionar notificaciones y preferencias de la aplicación.</p>
        </CardContent>
      </Card>
    </div>
  )
}
