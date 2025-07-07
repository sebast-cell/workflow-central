'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSidebar } from './ui/sidebar';
import { LogOut } from 'lucide-react';

// TODO: Replace this with real user data from an authentication context
const useUser = () => {
    const pathname = usePathname();
    const isPortal = pathname.startsWith('/portal');

    if (isPortal) {
        return {
            name: 'Olivia Martin', // Placeholder
            email: 'olivia.martin@example.com', // Placeholder
            avatarFallback: 'OM',
            profileUrl: '/portal/profile',
            settingsUrl: '/portal/settings',
        };
    }
    return {
        name: 'Administrador', // Placeholder
        email: 'admin@workflow.com', // Placeholder
        avatarFallback: 'AD',
        profileUrl: '/settings', // Admin profile might be part of settings
        settingsUrl: '/settings',
    };
};


export function UserDropdown() {
    const { isOpen } = useSidebar();
    const user = useUser();

    if (!isOpen) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="Avatar de usuario" />
                            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href={user.profileUrl}>Perfil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={user.settingsUrl}>Configuración</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/">Cerrar sesión</Link></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    
    return (
        <div className="space-y-4">
             <div className="flex items-center gap-3">
                 <Avatar className="h-9 w-9">
                   <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt={user.name} />
                   <AvatarFallback className="bg-sidebar-accent">{user.avatarFallback}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</span>
                      <span className="text-xs text-sidebar-muted-foreground truncate">{user.email}</span>
                 </div>
            </div>
             <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
                <Link href="/">
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="truncate">Cerrar Sesión</span>
                </Link>
            </Button>
        </div>
    )
}
