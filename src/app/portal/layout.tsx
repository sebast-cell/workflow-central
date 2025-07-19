// src/app/portal/layout.tsx
"use client"; // <--- ¡CRÍTICO! Este layout necesita ser un Client Component

import { useEffect, useState, useCallback } from 'react'; // Añadido useCallback
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, Auth } from 'firebase/auth'; // Importa Auth para tipado
import { doc, getDoc } from 'firebase/firestore'; // Importa doc y getDoc del SDK CLIENTE
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase'; // <--- ¡CAMBIO AQUÍ! Importa las funciones
import { Firestore } from 'firebase/firestore'; // Importa Firestore para tipado
import type { Employee } from '@/lib/api'; // Asegúrate de que este tipo sea correcto

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Estado para el indicador de carga
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Instancias de Firebase obtenidas de forma condicional
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  // Función para inicializar las instancias de Firebase
  const initializeFirebaseInstances = useCallback(() => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDB();
      setAuthInstance(auth);
      setDbInstance(db);
      return { auth, db };
    } catch (e: any) {
      console.error("Error al inicializar Firebase en PortalLayout:", e);
      // No se establece error en el estado aquí para evitar bucles o problemas de UI
      // Se asume que la redirección a login manejará el fallo
      return { auth: null, db: null };
    }
  }, []);

  useEffect(() => {
    const { auth: currentAuth, db: currentDb } = initializeFirebaseInstances();
    
    let unsubscribe: (() => void) | undefined;
    if (currentAuth && currentDb) { // Solo si auth y db se inicializaron correctamente
      unsubscribe = onAuthStateChanged(currentAuth, async (user) => {
        if (user) {
          setIsAuthenticated(true);
          setLoading(true); // Vuelve a poner loading mientras verifica rol
          try {
            const userDocRef = doc(currentDb, 'employees', user.uid); // <--- ¡CAMBIO AQUÍ! Colección 'employees'
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) { // <--- CAMBIO AQUÍ! .exists es propiedad, no método
              setUserRole(userDoc.data()?.role as string);
            } else {
              console.warn("Documento de rol no encontrado para UID:", user.uid);
              router.push('/login'); // Redirige si no hay datos de rol
            }
          } catch (err) {
            console.error("Error al obtener rol del usuario:", err);
            router.push('/login'); // Redirige en caso de error al obtener rol
          } finally {
            setLoading(false); // <--- ¡CORREGIDO! Usar setLoading
          }
        } else {
          // No hay usuario autenticado, redirigir a la página de login
          setIsAuthenticated(false);
          setLoading(false); // <--- ¡CORREGIDO! Usar setLoading
          router.push('/login');
        }
      });
    } else {
      // Si Firebase no se pudo inicializar, no hay usuario
      setLoading(false); // <--- ¡CORREGIDO! Usar setLoading
      router.push('/login'); // Redirige si hay un error crítico de Firebase
    }
    
    return () => {
      if (unsubscribe) unsubscribe(); // Limpia el listener
    };
  }, [router, initializeFirebaseInstances]); // Dependencias: router y la función de inicialización

  if (loading || !authInstance || !dbInstance) { // Muestra cargando si las instancias no están listas
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Verificando acceso al portal...</p>
      </div>
    );
  }

  // Lógica de autorización basada en roles (si es necesaria a este nivel)
  // Por ejemplo, si solo ciertos roles pueden ver el portal en general
  // if (userRole === 'Employee' && pathname.startsWith('/portal/admin')) {
  //   router.push('/access-denied');
  //   return null;
  // }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Layout del Portal ({userRole})</h2>
        {children}
      </div>
    );
  }

  // Si no está autenticado y no está cargando, no renderiza nada (ya fue redirigido)
  return null;
}
