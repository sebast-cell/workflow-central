'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Folder, File, PenSquare, Upload } from "lucide-react";

const folders = [
  { name: "Documentos Laborales", count: 12 },
  { name: "Nóminas", count: 48 },
  { name: "Recibos y Tickets", count: 34 },
  { name: "Justificantes", count: 8 },
  { name: "Fotos de ID y Cheques", count: 21 },
];

const recentFiles = [
    { name: "Contrato_Olivia_Martin.pdf", size: "2.1 MB", uploaded: "2024-08-10", signature: "Pendiente" },
    { name: "Recibo_Agosto_Internet.png", size: "300 KB", uploaded: "2024-08-09", signature: null },
    { name: "Justificante_Medico_JLee.pdf", size: "500 KB", uploaded: "2024-08-08", signature: "Firmado" },
    { name: "Nomina_Julio_2024.pdf", size: "1.2 MB", uploaded: "2024-08-01", signature: null },
]

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Sube, organiza y gestiona documentos de la empresa y los empleados.</p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Documento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Subir Nuevo Documento</DialogTitle>
                    <DialogDescription>
                        Selecciona un archivo y asígnalo a un empleado o a una carpeta de la empresa.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">Archivo</Label>
                        <Input id="file" type="file" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employee">Asignar a Empleado (Opcional)</Label>
                        <Select>
                            <SelectTrigger id="employee">
                                <SelectValue placeholder="Buscar empleado..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Olivia Martin</SelectItem>
                                <SelectItem value="2">Jackson Lee</SelectItem>
                                <SelectItem value="3">Isabella Nguyen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="folder">Guardar en Carpeta</Label>
                         <Select>
                            <SelectTrigger id="folder">
                                <SelectValue placeholder="Seleccionar carpeta" />
                            </SelectTrigger>
                            <SelectContent>
                                {folders.map(f => <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Subir Archivo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            <CardTitle className="font-headline">Archivos Subidos Recientemente</CardTitle>
            <CardDescription>Una lista de los documentos añadidos más recientemente.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre del Archivo</TableHead>
                        <TableHead>Tamaño</TableHead>
                        <TableHead>Fecha de Subida</TableHead>
                        <TableHead>Estado de Firma</TableHead>
                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentFiles.map((file, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <File className="h-4 w-4 text-muted-foreground"/>
                                {file.name}
                            </TableCell>
                            <TableCell>{file.size}</TableCell>
                            <TableCell>{file.uploaded}</TableCell>
                            <TableCell>
                                {file.signature ? (
                                    <Badge variant={file.signature === 'Firmado' ? 'secondary' : 'default'} className={
                                        file.signature === 'Firmado' ? 'bg-green-100 text-green-800' :
                                        file.signature === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : ''
                                    }>
                                        {file.signature}
                                    </Badge>
                                ) : (
                                   <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {file.name.endsWith('.pdf') && file.signature === 'Pendiente' && (
                                    <Button variant="ghost" size="sm">
                                        <PenSquare className="mr-2 h-4 w-4"/>
                                        Recordar Firma
                                    </Button>
                                )}
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
