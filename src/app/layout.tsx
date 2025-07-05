'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import LayoutProvider from '@/components/layout-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>WorkFlow Central</title>
        <meta name="description" content="El centro para gestionar a tu equipo sin esfuerzo." />
      </head>
      <body className="font-body antialiased">
        <LayoutProvider>{children}</LayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
