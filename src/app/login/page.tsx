// src/app/login/page.tsx
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  return (
    <div>
      <h1>Página de Inicio de Sesión</h1>
      {role && <p>Iniciando sesión como: {role}</p>}
      <p>Por favor, introduce tus credenciales.</p>
      {/* Aquí iría tu formulario de login */}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}