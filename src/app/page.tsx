import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function PortalSelectionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-12">
           <h1 className="text-5xl font-headline font-bold tracking-tight text-primary">WorkFlow Central</h1>
           <p className="mt-4 text-lg text-muted-foreground">Tu centro de mando para la gestión de equipos y el autoservicio de empleados.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Portal de Administrador</CardTitle>
                    <CardDescription>Gestiona tu equipo, proyectos y operaciones.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button asChild size="lg" className="w-full max-w-xs">
                        <Link href="/dashboard">
                            Acceder como Admin
                            <LogIn className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
           </Card>
           <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Portal del Empleado</CardTitle>
                    <CardDescription>Consulta tu información y gestiona tus solicitudes.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button asChild size="lg" className="w-full max-w-xs">
                        <Link href="/portal">
                            Acceder como Empleado
                            <LogIn className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
