import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Consulta y actualiza tu información personal.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">En Construcción</CardTitle>
            <CardDescription>Esta sección está actualmente en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aquí podrás editar tus datos personales, de contacto y de emergencia.</p>
        </CardContent>
      </Card>
    </div>
  )
}
