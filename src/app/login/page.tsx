import { Suspense } from 'react'; // <-- Se importa Suspense
import { LoginForm } from './_components/login-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Inicia sesión en tu cuenta
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Introduce tus credenciales para acceder a tu panel
        </p>
        <div className="mt-6">
          {/* Se envuelve el formulario en Suspense */}
          <Suspense fallback={<div>Cargando...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="font-semibold underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}