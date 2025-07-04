'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const adminUserData = {
    profileUrl: '/settings',
    settingsUrl: '/settings',
    userName: 'Usuario Administrador',
    userEmail: 'admin@workflow.com',
    userAvatarFallback: 'AU',
};

const employeeUserData = {
    profileUrl: '/portal/profile',
    settingsUrl: '/portal/settings',
    userName: 'Olivia Martin',
    userEmail: 'olivia.martin@example.com',
    userAvatarFallback: 'OM',
};

export function UserDropdown() {
    const pathname = usePathname();
    const [userData, setUserData] = useState(adminUserData);

    useEffect(() => {
        const isPortal = pathname.startsWith('/portal');
        setUserData(isPortal ? employeeUserData : adminUserData);
    }, [pathname]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="Avatar de usuario" />
                        <AvatarFallback>{userData.userAvatarFallback}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userData.userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userData.userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={userData.profileUrl}>Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={userData.settingsUrl}>Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">Cerrar sesión</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
