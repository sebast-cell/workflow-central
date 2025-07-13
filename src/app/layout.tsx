// src/app/layout.tsx
import './globals.css'; // Asegúrate de que esta ruta sea correcta si tienes un globals.css

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}