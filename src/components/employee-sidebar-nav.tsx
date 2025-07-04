'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  FileText,
  User,
  Settings,
  ClipboardList,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/portal', label: 'Panel', icon: LayoutDashboard },
  { href: '/portal/tasks', label: 'Mis Tareas', icon: ClipboardList },
  { href: '/portal/absences', label: 'Mis Ausencias', icon: CalendarCheck2 },
  { href: '/portal/documents', label: 'Mis Documentos', icon: FileText },
  { href: '/portal/profile', label: 'Mi Perfil', icon: User },
];

const secondaryNavItems = [
    { href: '/portal/settings', label: 'Configuración', icon: Settings },
]

export default function EmployeeSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full">
        <SidebarMenu>
        {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href) && (item.href !== '/portal' || pathname === '/portal')}
                    tooltip={{ children: item.label, side:'right' }}
                >
                    <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
        <SidebarMenu>
        {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                >
                    <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
    </div>
  );
}
