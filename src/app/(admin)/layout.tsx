'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';

// Este layout se aplicará a todas las rutas dentro del grupo (admin)
// como /dashboard, /employees, etc.
export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simplemente envolvemos las páginas de admin con nuestro layout principal.
  // El DashboardLayout ya se encarga de obtener los datos del usuario del contexto.
  return <DashboardLayout>{children}</DashboardLayout>;
}
