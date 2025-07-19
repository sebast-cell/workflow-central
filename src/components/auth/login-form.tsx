
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithEmailAndPassword, Auth } from 'firebase/auth';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    try {
      // Initialize Firebase Auth on the client
      setAuthInstance(getFirebaseAuth());
    } catch(e) {
      console.error("Failed to initialize Firebase Auth", e);
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
      // 1. Sign in on the client using Firebase SDK
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
      
      // 2. Get the ID token from the signed-in user
      const idToken = await user.getIdToken();

      // 3. Send the ID token to our API route to create a session cookie
      const response = await axios.post('/api/auth/login', { idToken });
      
      const { employee } = response.data;
      
      // 4. Update the auth context with the employee data from Firestore
      login(employee);

      // 5. Redirect to the correct dashboard
      if (employee.role === 'Owner' || employee.role === 'Admin') {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }

    } catch (err: any) {
      let errorMessage = 'Credenciales inválidas o error del servidor.';
      if (err.code) {
        switch(err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'El correo electrónico o la contraseña son incorrectos.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          default:
            errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';
        }
      } else if (err.response?.data?.message) {
         errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormDisabled = isLoading || isFirebaseLoading || !authInstance;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error de Inicio de Sesión</AlertTitle>
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
          disabled={isFormDisabled}
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
          disabled={isFormDisabled}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isFormDisabled}>
        {isLoading || isFirebaseLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? 'Iniciando sesión...' : isFirebaseLoading ? 'Cargando...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}
