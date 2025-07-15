'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Users,
  Clock,
  BarChart,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
  Calendar,
} from 'lucide-react';

// --- Definición de las rutas de navegación ---
const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Empleados', href: '/employees', icon: Users },
  { name: 'Asistencia', href: '/attendance', icon: Clock },
  { name: 'Reportes', href: '/reports', icon: BarChart },
  { name: 'Ajustes', href: '/settings', icon: Settings },
];

const employeeNavItems = [
  { name: 'Portal', href: '/portal', icon: Home },
  { name: 'Mis Tareas', href: '/portal/tasks', icon: CheckCircle },
  { name: 'Ausencias', href: '/portal/absences', icon: Calendar },
];

// --- Componente del Logo ---
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <path d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 21V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 16H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-xl font-bold font-headline">WorkFlow</span>
    </Link>
  );
}

// --- Componente de la Barra Lateral (Sidebar) ---
function SidebarContent({ navItems }: { navItems: typeof adminNavItems }) {
  const pathname = usePathname();
  const { userData } = useAuth(); // Usamos el hook para obtener los datos del usuario

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${
                  pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {userData?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="font-semibold text-sm">{userData?.name}</p>
                <p className="text-xs text-muted-foreground">{userData?.email}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal del Layout ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const router = useRouter();

  // Determina qué menú de navegación mostrar según el rol del usuario
  const navItems =
    userData?.role === 'Admin' || userData?.role === 'Owner'
      ? adminNavItems
      : employeeNavItems;
      
  const handleLogout = async () => {
    // Aquí iría la lógica para llamar a una API de logout que borre la cookie
    // Por ahora, redirigimos al login.
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {/* Sidebar para escritorio */}
      <aside className="hidden border-r bg-card lg:block">
        <SidebarContent navItems={navItems} />
      </aside>

      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          {/* Menú para móvil */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SidebarContent navItems={navItems} />
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1">
            {/* Puedes añadir aquí un campo de búsqueda si lo necesitas */}
          </div>

          <Button onClick={handleLogout} variant="outline" size="icon">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Cerrar sesión</span>
          </Button>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
