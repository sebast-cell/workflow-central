import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y de la aplicación.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">En Construcción</CardTitle>
            <CardDescription>Esta sección está actualmente en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>¡Vuelve pronto para configurar detalles de la empresa, roles, integraciones y más!</p>
        </CardContent>
      </Card>
    </div>
  )
}
