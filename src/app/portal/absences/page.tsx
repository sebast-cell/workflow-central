import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function EmployeeAbsencesPage() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Mis Ausencias</h1>
                <p className="text-muted-foreground">Consulta tu historial y solicita nuevo tiempo libre.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Solicitar Ausencia
            </Button>
        </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">En Construcción</CardTitle>
            <CardDescription>Esta sección está actualmente en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aquí podrás ver tu calendario de ausencias, el historial de solicitudes y su estado.</p>
        </CardContent>
      </Card>
    </div>
  )
}
