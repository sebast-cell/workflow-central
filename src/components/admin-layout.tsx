'use client';

import { Sidebar, SidebarProvider, useSidebar, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import SidebarNav from '@/components/sidebar-nav';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <>
      <Sidebar isCollapsed={!isOpen}>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
