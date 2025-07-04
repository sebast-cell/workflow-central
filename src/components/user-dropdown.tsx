'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function UserDropdown() {
    const pathname = usePathname();
    const isPortal = pathname.startsWith('/portal');

    const profileUrl = isPortal ? '/portal/profile' : '/settings';
    const settingsUrl = isPortal ? '/portal/settings' : '/settings';

    const userName = isPortal ? 'Olivia Martin' : 'Usuario Administrador';
    const userEmail = isPortal ? 'olivia.martin@example.com' : 'admin@workflow.com';
    const userAvatarFallback = isPortal ? 'OM' : 'AU';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="Avatar de usuario" />
                        <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={profileUrl}>Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={settingsUrl}>Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/">Cerrar sesión</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
