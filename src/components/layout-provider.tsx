
'use client';

import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { PortalLayout } from '@/components/portal-layout';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAuth();

  const publicPages = ['/', '/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);
  
  const isPortalRoute = pathname.startsWith('/portal');

  // While checking auth status on the client, show a loading screen.
  // This prevents layout flashes or incorrect redirects.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If it's a public page, render it without any special layout.
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Otherwise, apply the correct layout based on the route.
  const Layout = isPortalRoute ? PortalLayout : AdminLayout;

  return <Layout>{children}</Layout>;
}
