import type { Metadata } from 'next';
import './globals.css';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import SidebarNav from '@/components/sidebar-nav';
import { Briefcase } from 'lucide-react';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WorkFlow Central',
  description: 'El centro para gestionar a tu equipo sin esfuerzo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2.5">
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
        <Toaster />
      </body>
    </html>
  );
}
