'use client';

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import EmployeeSidebarNav from '@/components/employee-sidebar-nav';
import { Briefcase } from 'lucide-react';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/portal" className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">Portal Empleado</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <EmployeeSidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9">
               <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="employee avatar" alt="Olivia Martin" />
               <AvatarFallback>OM</AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="text-sm font-semibold text-sidebar-foreground">Olivia Martin</span>
               <span className="text-xs text-sidebar-foreground/70">olivia.martin@example.com</span>
             </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header/>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
