'use client';

import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import SidebarNav from '@/components/sidebar-nav'; // <-- CORRECCIÓN 1

export function AdminLayout({ children }: { children: React.ReactNode }) {
  // Se añade esta línea para obtener el estado de la barra lateral
  const { isOpen } = useSidebar();

  return (
    <SidebarProvider>
      {/* CORRECCIÓN 2: Se añade la propiedad isCollapsed */}
      <Sidebar isCollapsed={!isOpen}>
        <SidebarNav />
      </Sidebar>
      <main className="flex-1">
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}