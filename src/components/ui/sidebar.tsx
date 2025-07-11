'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Home, Users, Briefcase, BarChart3, FileText, Settings, LogOut, Building, User, Calendar, CheckSquare, Trophy, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mainNavLinks = [
  { href: '/dashboard', label: 'Panel Principal', icon: Home },
  { href: '/employees', label: 'Empleados', icon: Users },
  { href: '/attendance', label: 'Asistencia', icon: Calendar },
  { href: '/absences', label: 'Ausencias', icon: User },
  { href: '/projects', label: 'Proyectos', icon: Briefcase },
  { href: '/performance', label: 'Desempeño', icon: Trophy },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/reports', label: 'Informes', icon: BarChart3 },
];

const portalNavLinks = [
    { href: '/portal', label: 'Mi Portal', icon: User },
    { href: '/portal/attendance', label: 'Mi Asistencia', icon: Calendar },
    { href: '/portal/absences', label: 'Mis Ausencias', icon: Calendar },
    { href: '/portal/tasks', label: 'Mis Tareas', icon: CheckSquare },
    { href: '/portal/performance', label: 'Mi Desempeño', icon: Trophy },
    { href: '/portal/documents', label: 'Mis Documentos', icon: FileText },
    { href: '/portal/profile', label: 'Mi Perfil', icon: User },
];

const settingsNavLinks = [
  { href: '/settings', label: 'Configuración', icon: Settings },
  { href: '/logout', label: 'Cerrar Sesión', icon: LogOut },
];

const NavLink = ({ href, label, icon: Icon, isCollapsed }: { href: string, label: string, icon: React.ElementType, isCollapsed: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn('w-full justify-start', isCollapsed && 'justify-center px-2')}
          >
            <Link href={href}>
              <Icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
              {!isCollapsed && label}
            </Link>
          </Button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith('/portal');
  const navLinks = isPortal ? portalNavLinks : mainNavLinks;
  
  return (
    <aside className={cn(
      "hidden md:flex flex-col h-full border-r bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center h-16 border-b px-6">
        <Building className="h-6 w-6 text-primary" />
        {!isCollapsed && <span className="ml-3 text-lg font-bold">WorkFlow</span>}
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} isCollapsed={isCollapsed} />
        ))}
      </nav>
      <div className="mt-auto p-4 space-y-2">
        <Separator />
        {settingsNavLinks.map((link) => (
          <NavLink key={link.href} {...link} isCollapsed={isCollapsed} />
        ))}
      </div>
    </aside>
  );
}