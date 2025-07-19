'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context';

export default function PortalSelectionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && user) {
        if (user.role === 'Owner' || user.role === 'Admin') {
            router.push('/dashboard');
        } else if (user.role === 'Employee') {
            router.push('/portal');
        }
    }
  }, [user, isLoading, router]);
  
  if (isLoading || user) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40">
          <LogIn className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-12">
           <h1 className="text-5xl font-bold tracking-tight text-primary">WorkFlow Central</h1>
           <p className="mt-4 text-lg text-muted-foreground">Tu centro de mando para la gestión de equipos y el autoservicio de empleados.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 bg-gradient-accent-to-card">
              <h2 className="text-2xl font-bold text-card-foreground">Portal de Administrador</h2>
              <p className="text-muted-foreground mt-2">Gestiona tu equipo, proyectos y operaciones.</p>
              <div className="flex justify-center mt-8">
                  <Button asChild size="lg" className="w-full max-w-xs">
                      <Link href="/login?role=admin">
                          Acceder como Admin
                          <LogIn className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
              </div>
          </Card>
          <Card className="p-8 text-center hover:shadow-xl transition-shadow duration-300 bg-gradient-accent-to-card">
              <h2 className="text-2xl font-bold text-card-foreground">Portal del Empleado</h2>
              <p className="text-muted-foreground mt-2">Consulta tu información y gestiona tus solicitudes.</p>
              <div className="flex justify-center mt-8">
                  <Button asChild size="lg" className="w-full max-w-xs">
                       <Link href="/login?role=employee">
                          Acceder como Empleado
                          <LogIn className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
