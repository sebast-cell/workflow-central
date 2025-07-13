
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md mx-4 bg-gradient-accent-to-card text-center">
        <CardHeader>
          <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Registro por Invitación
          </CardTitle>
          <CardDescription>
            Las cuentas de WorkFlow Central se crean únicamente a través de una invitación de un administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Si crees que deberías tener acceso, por favor, ponte en contacto con el administrador de tu empresa.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline font-semibold hover:text-primary">
              Inicia sesión aquí
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
