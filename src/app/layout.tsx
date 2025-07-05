import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import LayoutProvider from '@/components/layout-provider';

export const metadata: Metadata = {
  title: 'WorkFlow Central',
  description: 'El centro para gestionar a tu equipo sin esfuerzo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-body antialiased">
        <LayoutProvider>{children}</LayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
