'use client';

import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { PortalLayout } from '@/components/portal-layout';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortalRoute = pathname.startsWith('/portal');
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return <>{children}</>;
  }

  const Layout = isPortalRoute ? PortalLayout : AdminLayout;

  return <Layout>{children}</Layout>;
}
