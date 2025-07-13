
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
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/employee', label: 'Empleados', icon: Users },
  { href: '/attendance', label: 'Asistencia', icon: Clock },
  { href: '/absences', label: 'Ausencias y TL', icon: CalendarOff },
  { href: '/projects', label: 'Proyectos', icon: Briefcase },
  { href: '/performance', label: 'Desempeño', icon: TrendingUp },
  { href: '/documents', label: 'Documentos', icon: Folder },
  { href: '/reports', label: 'Informes', icon: FileText },
];

const secondaryNavItems = [
    { href: '/settings', label: 'Configuración', icon: Settings },
]

export default function SidebarNav() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();

  return (
    <div className="flex flex-col justify-between h-full">
        <SidebarMenu>
        {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{ children: item.label, side:'right' }}
                >
                    <Link href={item.href}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
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
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
    </div>
  );
}
