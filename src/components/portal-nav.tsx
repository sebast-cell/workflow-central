'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, CheckSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const links = [
  { name: 'Portal', href: '/portal', icon: LayoutDashboard },
  { name: 'Absences', href: '/absences', icon: CalendarDays },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Settings', href: '/portal/settings', icon: Settings },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className="flex flex-col items-start gap-2 px-2 sm:py-5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Tooltip key={link.name} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
                    'w-full justify-start'
                  )}
                >
                  <link.icon className="h-4 w-4 mr-2" />
                  <span className="truncate">{link.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
