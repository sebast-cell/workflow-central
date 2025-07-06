'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, UserPlus, CalendarCheck, FileText, CheckCircle } from 'lucide-react';
import { UserDropdown } from '@/components/user-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Admin notifications
const adminNotifications = [
    { icon: UserPlus, text: "Nuevo empleado, Liam Garcia, ha sido añadido.", time: "hace 5m", href: "/employees" },
    { icon: CalendarCheck, text: "Jackson Lee ha solicitado tiempo libre.", time: "hace 15m", href: "/absences" },
    { icon: FileText, text: "El informe de asistencia de Julio está listo.", time: "hace 1h", href: "/reports" },
];

// Employee notifications
const employeeNotifications = [
    { icon: CheckCircle, text: "Tu solicitud de vacaciones ha sido aprobada.", time: "hace 10m", href: "/portal/absences" },
    { icon: FileText, text: "Tu nómina de Agosto ya está disponible.", time: "hace 2h", href: "/portal/documents" },
    { icon: UserPlus, text: "Tu evaluación de desempeño del Q3 está pendiente.", time: "hace 1d", href: "/portal/performance" },
];


export function Header() {
    const pathname = usePathname();
    const isPortal = pathname.startsWith('/portal');
    const notifications = isPortal ? employeeNotifications : adminNotifications;

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Placeholder for breadcrumbs or page title */}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative rounded-full">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="space-y-1">
                            {notifications.map((notification, index) => (
                                <DropdownMenuItem key={index} asChild className="cursor-pointer">
                                    <Link href={notification.href} className="flex items-start gap-3">
                                        <notification.icon className="mt-1 h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-tight whitespace-normal">{notification.text}</p>
                                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary cursor-pointer">
                            Marcar todas como leídas
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <UserDropdown />
            </div>
        </header>
    );
}
