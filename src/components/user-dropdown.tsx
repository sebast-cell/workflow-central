
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from './ui/sidebar';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function UserDropdown() {
    const { isOpen } = useSidebar();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPortal = pathname.startsWith('/portal');

    const handleLogout = () => {
        logout();
        router.push('/');
    };
    
    const profileUrl = isPortal ? '/portal/profile' : '/settings';
    const settingsUrl = isPortal ? '/portal/settings' : '/settings';
    const avatarFallback = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

    if (!user) {
        return null;
    }

    if (!isOpen) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt="Avatar de usuario" />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
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
                    <DropdownMenuItem asChild><Link href={profileUrl}>Perfil</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={settingsUrl}>Configuración</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    
    return (
        <div className="space-y-4">
             <div className="flex items-center gap-3">
                 <Avatar className="h-9 w-9">
                   <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" alt={user.name} />
                   <AvatarFallback className="bg-sidebar-accent">{avatarFallback}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</span>
                      <span className="text-xs text-sidebar-muted-foreground truncate">{user.email}</span>
                 </div>
            </div>
             <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
            </Button>
        </div>
    )
}
