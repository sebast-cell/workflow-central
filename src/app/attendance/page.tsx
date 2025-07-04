import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Coffee, Globe, Home, UserCheck, UserX } from "lucide-react";

const attendanceLog = [
  { time: "09:01 AM", employee: "Olivia Martin", status: "Entrada Marcada", location: "Oficina" },
  { time: "09:03 AM", employee: "Jackson Lee", status: "Entrada Marcada", location: "Remoto" },
  { time: "11:30 AM", employee: "Isabella Nguyen", status: "En Descanso", location: "Oficina" },
  { time: "12:15 PM", employee: "Isabella Nguyen", status: "Entrada Marcada", location: "Oficina" },
  { time: "02:00 PM", employee: "William Kim", status: "Entrada Marcada", location: "Oficina" },
  { time: "05:05 PM", employee: "Olivia Martin", status: "Salida Marcada", location: "Oficina" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Tiempo y Asistencia</h1>
        <p className="text-muted-foreground">Monitorea las entradas diarias, estados y cronogramas.</p>
      </div>

      <div>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Husin (Quién está dentro)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Oficina</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">28</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trabajo Remoto</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">14</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Descanso</CardTitle>
                <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">5</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">De Vacaciones</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ausente</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1</div>
            </CardContent>
            </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Timeline de Fichajes</CardTitle>
          <CardDescription>Un registro en tiempo real de los eventos de entrada de hoy.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Select>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="remote">Remoto</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Ingeniería</SelectItem>
                  <SelectItem value="design">Diseño</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Hora</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ubicación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceLog.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.employee}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        log.status === "Entrada Marcada" ? "border-green-500 text-green-700" :
                        log.status === "Salida Marcada" ? "border-red-500 text-red-700" :
                        "border-yellow-500 text-yellow-700"
                      }
                    >{log.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{log.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
