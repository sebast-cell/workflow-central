'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check, Clock, FileText, User } from "lucide-react";

export default function EmployeeDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Hola, Olivia</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu jornada y tus tareas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Entrada Marcada</div>
            <p className="text-xs text-muted-foreground">a las 09:01 AM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horario de Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9:00 - 17:00</div>
            <p className="text-xs text-muted-foreground">Turno estándar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Ausencias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19 Ago</div>
            <p className="text-xs text-muted-foreground">Vacaciones (5 días)</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Pendientes de firma</p>
            </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button>Marcar Salida</Button>
                <Button variant="outline">Empezar Descanso</Button>
                <Button variant="secondary" className="col-span-2">Solicitar Ausencia</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Mi Perfil</CardTitle>
                <CardDescription>Mantén tu información actualizada.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <User className="w-10 h-10 text-primary" />
                <div>
                    <p className="font-semibold">Olivia Martin</p>
                    <p className="text-sm text-muted-foreground">olivia.martin@example.com</p>
                    <Button variant="link" className="p-0 h-auto mt-1">Editar Perfil</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
