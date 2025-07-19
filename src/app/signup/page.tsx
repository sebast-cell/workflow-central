
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    try {
      setAuthInstance(getFirebaseAuth());
    } catch (e) {
      console.error("Error al inicializar Firebase en SignupPage:", e);
      setError("No se pudieron cargar los servicios de autenticación.");
    } finally {
      setIsFirebaseLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInstance) {
      setError("El servicio de autenticación no está listo.");
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;

      await axios.post('/api/employees', {
        email: user.email,
        name: name,
        uid: user.uid,
      });

      router.push('/login');
      
    } catch (err: any) {
      console.error("Error de registro:", err);
      let errorMessage = 'Error al registrarse.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || isFirebaseLoading || !authInstance;
  
  // This is a placeholder signup form. In a real app, this might be invite-only.
  // For now, we will show an "invite-only" message as per the original component.
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
