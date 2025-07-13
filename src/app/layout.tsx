
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import LayoutProvider from '@/components/layout-provider';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata = {
  title: 'Workflow Central App',
  description: 'Tu centro de mando para la gestión de equipos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-body antialiased">
        <AuthProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
