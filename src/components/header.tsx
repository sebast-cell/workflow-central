'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { UserDropdown } from '@/components/user-dropdown';

export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Placeholder for breadcrumbs or page title */}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-full">
                    <Bell className="h-5 w-5" />
                </Button>
                <UserDropdown />
            </div>
        </header>
    );
}
