
<<<<<<< HEAD
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, LogIn, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const role = searchParams.get('role') || 'admin';
  const isAdminLogin = role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password, role });
      login(response.data);
      
      // Redirect based on role
      if (isAdminLogin) {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
=======
// src/app/login/page.tsx
"use client"; // <--- ¡AÑADE ESTA LÍNEA AL PRINCIPIO!

import { Suspense, useState } from 'react'; // Importa useState
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const [email, setEmail] = useState(''); // Estado para el email
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [error, setError] = useState(''); // Estado para mensajes de error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita el recargado de la página
    setError(''); // Limpia errores anteriores

    // Aquí iría la lógica de autenticación real
    // Por ahora, una simulación simple:
    if (email === 'admin@example.com' && password === 'password123' && role === 'admin') {
      alert('¡Inicio de sesión de administrador exitoso!');
      // Redirigir al panel de administrador
      window.location.href = '/portal/admin'; // O usar useRouter
    } else if (email === 'empleado@example.com' && password === 'password123' && role === 'employee') {
      alert('¡Inicio de sesión de empleado exitoso!');
      // Redirigir al panel de empleado
      window.location.href = '/portal/empleado'; // O usar useRouter
    } else {
      setError('Credenciales incorrectas o rol no coincide.');
>>>>>>> f82117f479ac19379af2965913c66ec24753ba05
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md mx-4 bg-gradient-accent-to-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Portal de {isAdminLogin ? 'Administrador' : 'Empleado'}
            </CardTitle>
            <CardDescription>
              Introduce tus credenciales para acceder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error de inicio de sesión</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
              {isLoading ? 'Accediendo...' : 'Acceder'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ¿No tienes cuenta? <Link href="/signup" className="underline hover:text-primary">Regístrate</Link> o <Link href="/" className="underline hover:text-primary">vuelve a la selección</Link>.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Página de Inicio de Sesión</h1>
        {role && <p className="text-center text-gray-600 mb-4">Iniciando sesión como: <span className="font-semibold capitalize">{role}</span></p>}
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Correo Electrónico:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Cargando formulario de inicio de sesión...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
>>>>>>> f82117f479ac19379af2965913c66ec24753ba05
