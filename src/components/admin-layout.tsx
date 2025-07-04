'use client';

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import { Briefcase } from 'lucide-react';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">WorkFlow Central</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9">
               <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="Usuario Administrador" />
               <AvatarFallback>AU</AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="text-sm font-semibold text-sidebar-foreground">Usuario Administrador</span>
               <span className="text-xs text-sidebar-foreground/70">admin@workflow.com</span>
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
