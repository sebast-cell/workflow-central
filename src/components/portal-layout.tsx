'use client';

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarHeader, SidebarFooter, SidebarPin, useSidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import EmployeeSidebarNav from '@/components/employee-sidebar-nav';
import { Briefcase, LogOut } from 'lucide-react';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
           <div className="flex items-center gap-3 mb-4">
             <Avatar className="h-9 w-9">
               <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="employee avatar" alt="Olivia Martin" />
               <AvatarFallback className="bg-sidebar-accent">OM</AvatarFallback>
             </Avatar>
             {isOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">Olivia Martin</span>
                  <span className="text-xs text-sidebar-muted-foreground">olivia.martin@example.com</span>
                </div>
              )}
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/">
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="truncate">Cerrar Sesión</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
