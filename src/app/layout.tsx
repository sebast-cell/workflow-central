'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { PortalLayout } from '@/components/portal-layout';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPortalRoute = pathname.startsWith('/portal');
  const isHomePage = pathname === '/';

  const Layout = isPortalRoute ? PortalLayout : AdminLayout;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>WorkFlow Central</title>
        <meta name="description" content="El centro para gestionar a tu equipo sin esfuerzo." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {isHomePage ? (
          <>{children}</>
        ) : (
          <Layout>{children}</Layout>
        )}
        <Toaster />
      </body>
    </html>
  );
}
