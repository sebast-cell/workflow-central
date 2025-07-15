'use client';

import DashboardLayout from '@/components/layouts/dashboard-layout';

// Este layout se aplicará a todas las rutas dentro del grupo (portal)
// como /portal, /portal/absences, etc.
export default function PortalPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reutilizamos el mismo layout principal.
  // Se adaptará automáticamente para mostrar el menú de empleado.
  return <DashboardLayout>{children}</DashboardLayout>;
}
