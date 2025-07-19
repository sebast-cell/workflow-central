// src/app/portal/layout.tsx
"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PortalLayout as PortalLayoutComponent } from '@/components/portal-layout';

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p className="ml-2 text-lg">Verificando acceso al portal...</p>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    // Esto podría ocurrir en un flash mientras redirige.
    // El AuthProvider ya debería haber redirigido, pero esta es una salvaguarda.
    if(typeof window !== 'undefined') {
      router.push('/login?role=employee');
    }
    return null;
  }
  
  // Opcional: Redirección si un Admin o Owner intenta acceder al portal de empleado directamente.
  if (user.role === 'Admin' || user.role === 'Owner') {
     if(typeof window !== 'undefined') {
      router.push('/dashboard');
    }
    return null;
  }

  return (
    <PortalLayoutComponent>
      {children}
    </PortalLayoutComponent>
  );
}
