import type { Metadata } from 'next';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/contexts/auth-context';

// Nota: El componente LayoutProvider no estaba en una de las versiones,
// si lo necesitas, asegúrate de que el import es correcto.
// import LayoutProvider from '@/components/layout-provider';

export const metadata: Metadata = {
  title: 'WorkFlow Central',
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
          <SidebarProvider>
            {/* Si usas LayoutProvider, envuelve a children: <LayoutProvider>{children}</LayoutProvider> */}
            {children}
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}