'use client';

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarHeader, SidebarFooter, SidebarPin, useSidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import { Briefcase, LogOut } from 'lucide-react';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

function AdminSidebarContent() {
  const { isOpen } = useSidebar();
  return (
    <>
       <SidebarHeader>
           <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="bg-primary/10 text-primary p-2 rounded-md">
                <Briefcase className="h-6 w-6" />
              </div>
               {isOpen && <h1 className="text-lg font-semibold text-foreground">WorkFlow Central</h1>}
            </Link>
            {isOpen && <SidebarPin />}
          </div>
          <div className="flex items-center gap-3">
             <Avatar className="h-12 w-12">
               <AvatarImage src="https://placehold.co/48x48.png" data-ai-hint="user avatar" alt="Usuario Administrador" />
               <AvatarFallback>AU</AvatarFallback>
             </Avatar>
             {isOpen && (
                <div className="flex flex-col">
                  <span className="text-base font-medium text-foreground">Usuario Administrador</span>
                  <span className="text-sm text-muted-foreground">Administrador</span>
                </div>
              )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
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


export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebarContent />
      </Sidebar>
      <SidebarInset>
        <Header/>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
