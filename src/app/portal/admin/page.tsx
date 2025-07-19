// src/app/portal/admin/page.tsx
"use client"; // <--- ¡CRÍTICO! Marca como Client Component

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; // Importa doc y getDoc del SDK CLIENTE
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase'; // <--- ¡CAMBIO AQUÍ! Importa las funciones

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Instancias de Firebase obtenidas de forma condicional
  const [authInstance, setAuthInstance] = useState<any>(null); // Puede ser de tipo Auth
  const [dbInstance, setDbInstance] = useState<any>(null);   // Puede ser de tipo Firestore

  useEffect(() => {
    try {
      const auth = getFirebaseAuth(); // Obtiene la instancia de Auth
      const db = getFirebaseDB();     // Obtiene la instancia de DB
      setAuthInstance(auth);
      setDbInstance(db);

      const fetchUserData = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserEmail(currentUser.email);
          try {
            if (db) { // Asegúrate de que db esté inicializado
              const userDocRef = doc(db, 'employees', currentUser.uid); // <--- ¡CAMBIO AQUÍ! Colección 'employees'
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                setUserRole(userDoc.data()?.role as string);
              }
            }
          } catch (err) {
            console.error("Error al obtener datos de usuario para AdminPage:", err);
          }
        }
        setLoading(false);
      };
      fetchUserData();
    } catch (e) {
      console.error("Error al inicializar Firebase en AdminPage:", e);
      setLoading(false); // Deja de cargar incluso si hay error
    }
  }, []); // Dependencia vacía para que se ejecute una sola vez

  if (loading || !authInstance || !dbInstance) { // Muestra cargando si las instancias no están listas
    return <p>Cargando datos de administrador...</p>;
  }

  return (
    <div>
      <h1>Página de Administrador</h1>
      <p>Bienvenido al panel de administración.</p>
      {userEmail && <p>Autenticado como: {userEmail}</p>}
      {userRole && <p>Tu rol: {userRole}</p>}
      {/* Aquí iría el resto de tus componentes de UI para el administrador */}
    </div>
  );
}
