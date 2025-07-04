import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function EmployeeDocumentsPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Mis Documentos</h1>
                <p className="text-muted-foreground">Accede a tus documentos personales y de la empresa.</p>
            </div>
            <Button>
                <Upload className="mr-2 h-4 w-4" />
                Subir Documento
            </Button>
        </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">En Construcción</CardTitle>
            <CardDescription>Esta sección está actualmente en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Aquí podrás ver tus nóminas, contratos y otros documentos importantes.</p>
        </CardContent>
      </Card>
    </div>
  )
}
