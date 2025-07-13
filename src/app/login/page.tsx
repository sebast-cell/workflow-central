
// src/app/login/page.tsx
"use client"; // <--- ¡AÑADE ESTA LÍNEA AL PRINCIPIO!

import { Suspense, useState } from 'react'; // Importa useState
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const [email, setEmail] = useState(''); // Estado para el email
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [error, setError] = useState(''); // Estado para mensajes de error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita el recargado de la página
    setError(''); // Limpia errores anteriores

    // Aquí iría la lógica de autenticación real
    // Por ahora, una simulación simple:
    if (email === 'admin@example.com' && password === 'password123' && role === 'admin') {
      alert('¡Inicio de sesión de administrador exitoso!');
      // Redirigir al panel de administrador
      window.location.href = '/portal/admin'; // O usar useRouter
    } else if (email === 'empleado@example.com' && password === 'password123' && role === 'employee') {
      alert('¡Inicio de sesión de empleado exitoso!');
      // Redirigir al panel de empleado
      window.location.href = '/portal/empleado'; // O usar useRouter
    } else {
      setError('Credenciales incorrectas o rol no coincide.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Página de Inicio de Sesión</h1>
        {role && <p className="text-center text-gray-600 mb-4">Iniciando sesión como: <span className="font-semibold capitalize">{role}</span></p>}
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Correo Electrónico:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Cargando formulario de inicio de sesión...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
