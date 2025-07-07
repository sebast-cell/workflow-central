'use client';

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarHeader, SidebarFooter, SidebarPin, useSidebar } from '@/components/ui/sidebar';
import EmployeeSidebarNav from '@/components/employee-sidebar-nav';
import { Briefcase } from 'lucide-react';
import { Header } from '@/components/header';
import { UserDropdown } from '@/components/user-dropdown';
import Link from 'next/link';

function PortalSidebarContent() {
  const { isOpen } = useSidebar();
  return (
    <>
       <SidebarHeader>
           <div className="flex items-center justify-between">
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground p-2 rounded-md">
                <Briefcase className="h-6 w-6" />
              </div>
              {isOpen && <h1 className="text-xl font-semibold text-sidebar-foreground">Portal Empleado</h1>}
            </Link>
            {isOpen && <SidebarPin />}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <EmployeeSidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <UserDropdown />
        </SidebarFooter>
    </>
  )
}

export function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <PortalSidebarContent />
      </Sidebar>
      <SidebarInset>
        <Header/>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
