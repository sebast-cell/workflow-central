'use client';

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarHeader, SidebarFooter, SidebarPin, useSidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import { Briefcase, LogOut } from 'lucide-react';
import { Header } from '@/components/header';
import { UserDropdown } from '@/components/user-dropdown';
import Link from 'next/link';

function AdminSidebarContent() {
  const { isOpen } = useSidebar();
  return (
    <>
       <SidebarHeader>
           <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground p-2 rounded-md">
                <Briefcase className="h-6 w-6" />
              </div>
               {isOpen && <h1 className="text-xl font-semibold text-sidebar-foreground">WorkFlow Central</h1>}
            </Link>
            {isOpen && <SidebarPin />}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <UserDropdown />
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
