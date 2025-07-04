import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle } from "lucide-react";

const requests = [
  { employee: "Liam Johnson", type: "Vacaciones", dates: "19 Ago - 23 Ago, 2024", status: "Aprobado" },
  { employee: "Emma Wilson", type: "Licencia Médica", dates: "12 Ago, 2024", status: "Aprobado" },
  { employee: "Noah Brown", type: "Vacaciones", dates: "02 Sep - 06 Sep, 2024", status: "Pendiente" },
  { employee: "Ava Smith", type: "Día Personal", dates: "15 Ago, 2024", status: "Rechazado" },
];

export default function AbsencesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Ausencias y Tiempo Libre</h1>
        <p className="text-muted-foreground">Gestiona vacaciones, licencias por enfermedad y otras ausencias de los empleados.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Calendario de Ausencias del Equipo</CardTitle>
              <CardDescription>Vista mensual de todas las ausencias del equipo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border w-full"
                numberOfMonths={1}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="vacations" defaultChecked/>
                <label htmlFor="vacations" className="text-sm font-medium leading-none">Vacaciones</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="absences" defaultChecked/>
                <label htmlFor="absences" className="text-sm font-medium leading-none">Ausencias</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="holidays" />
                <label htmlFor="holidays" className="text-sm font-medium leading-none">Festivos</label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Asignar Ausencia
                </Button>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Datos
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Solicitudes Pendientes y Recientes</CardTitle>
          <CardDescription>Revisa y gestiona las solicitudes de ausencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{request.employee}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.dates}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        request.status === "Aprobado" ? "bg-green-100 text-green-800" :
                        request.status === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }
                      variant="secondary"
                    >{request.status}</Badge>
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
