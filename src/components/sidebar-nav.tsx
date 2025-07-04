'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  CalendarOff,
  Clock,
  FileText,
  Folder,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/employees', label: 'Empleados', icon: Users },
  { href: '/attendance', label: 'Asistencia', icon: Clock },
  { href: '/absences', label: 'Ausencias y TL', icon: CalendarOff },
  { href: '/projects', label: 'Proyectos', icon: Briefcase },
  { href: '/documents', label: 'Documentos', icon: Folder },
  { href: '/reports', label: 'Informes', icon: FileText },
];

const secondaryNavItems = [
    { href: '/settings', label: 'Configuración', icon: Settings },
]

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full">
        <SidebarMenu>
        {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
