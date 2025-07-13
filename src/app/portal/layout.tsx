// src/app/portal/layout.tsx
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Puedes añadir aquí elementos comunes para todas las páginas de portal, como una barra lateral o un encabezado */}
      <h2>Layout del Portal</h2>
      {children}
    </div>
  );
}