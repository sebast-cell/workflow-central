import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Folder, File, Upload, Download } from "lucide-react";

const folders = [
  { name: "Mis Nóminas", count: 12 },
  { name: "Mis Contratos", count: 2 },
  { name: "Recibos Personales", count: 8 },
];

const recentFiles = [
    { name: "Nomina_Agosto_2024.pdf", size: "1.2 MB", shared: "2024-09-01", type: "Nómina" },
    { name: "Contrato_Inicial.pdf", size: "2.1 MB", shared: "2023-01-15", type: "Contrato" },
    { name: "Recibo_Formacion_UX.pdf", size: "450 KB", shared: "2024-08-20", type: "Recibo" },
    { name: "Nomina_Julio_2024.pdf", size: "1.2 MB", shared: "2024-08-01", type: "Nómina" },
]

export default function EmployeeDocumentsPage() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Mis Documentos</h1>
          <p className="text-muted-foreground">Accede a tus documentos personales y de empresa.</p>
        </div>
         <Button>
            <Upload className="mr-2 h-4 w-4" />
            Subir Recibo/Justificante
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder, index) => (
            <Card key={index} className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Folder className="h-8 w-8 text-primary"/>
                        <span className="text-xs text-muted-foreground">{folder.count} archivos</span>
                    </div>
                    <p className="font-semibold mt-4">{folder.name}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Archivos Recientes</CardTitle>
            <CardDescription>Tus documentos subidos o compartidos más recientemente.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre del Archivo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentFiles.map((file, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <File className="h-4 w-4 text-muted-foreground"/>
                                {file.name}
                            </TableCell>
                            <TableCell><Badge variant="outline">{file.type}</Badge></TableCell>
                            <TableCell>{file.shared}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
