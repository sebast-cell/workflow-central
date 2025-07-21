'use client';

import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAuth();

  const publicPages = ['/', '/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  // Mientras se verifica el estado de autenticación, mostrar un spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si es una página pública, renderiza sin layout especial
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Si es ruta del portal, se usa el layout propio definido en app/portal/layout.tsx
  // así que no hace falta envolverlo aquí
  if (pathname.startsWith('/portal')) {
    return <>{children}</>;
  }

  // Para otras rutas (por ejemplo /dashboard), usa AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}
