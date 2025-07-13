
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, UserPlus, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { createEmployee } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real app, you'd have a separate signup API that also creates a user in Firebase Auth.
      // For now, we'll just create an employee record and log them in.
      const newEmployee = await createEmployee({
        name,
        email,
        // Default values for a new signup
        department: 'Sin Asignar',
        role: 'Empleado',
        schedule: 'No Definido',
        hireDate: new Date().toISOString().split('T')[0],
        phone: '',
      });
      
      login(newEmployee);
      router.push('/portal');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Could not create account.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md mx-4 bg-gradient-accent-to-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Crear una Cuenta
            </CardTitle>
            <CardDescription>
              Regístrate para acceder al Portal del Empleado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error de Registro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
             <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ¿Ya tienes una cuenta? <Link href="/login?role=employee" className="underline hover:text-primary">Inicia sesión</Link>.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
