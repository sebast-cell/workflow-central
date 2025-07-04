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
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: Clock },
  { href: '/absences', label: 'Absences & PTO', icon: CalendarOff },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/documents', label: 'Documents', icon: Folder },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const secondaryNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
]

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full">
        <SidebarMenu>
        {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side:'right' }}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                </SidebarMenuButton>
            </Link>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
        <SidebarMenu>
        {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right' }}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                </SidebarMenuButton>
            </Link>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
    </div>
  );
}
