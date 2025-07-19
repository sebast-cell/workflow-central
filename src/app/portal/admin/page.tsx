// src/app/portal/admin/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase';
import { Auth, User } from 'firebase/auth'; // Importa User para tipado
import type { Employee } from '@/lib/api'; // Asegúrate de que este tipo sea correcto

export default function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDB();
      setAuthInstance(auth);
      setDbInstance(db);

      const fetchUserData = async (currentUser: User) => { // Recibe currentUser como parámetro
        setUserEmail(currentUser.email);
        try {
          if (db) {
            const userDocRef = doc(db, 'employees', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserRole(userDoc.data()?.role as string);
            }
          }
        } catch (err) {
          console.error("Error al obtener datos de usuario para AdminPage:", err);
        } finally {
          setLoading(false);
        }
      };

      if (auth.currentUser) { // Si ya hay un usuario logueado al cargar la página
        fetchUserData(auth.currentUser);
      } else {
        // Si no hay usuario, espera onAuthStateChanged en el layout o redirige
        setLoading(false);
        // Opcional: router.push('/login'); si esta página no debe ser accesible sin autenticación
      }
    } catch (e) {
      console.error("Error al inicializar Firebase en AdminPage:", e);
      setLoading(false);
    }
  }, []);

  if (loading || !authInstance || !dbInstance) {
    return <p>Cargando datos de administrador...</p>;
  }

  return (
    <div>
      <h1>Página de Administrador</h1>
      <p>Bienvenido al panel de administración.</p>
      {userEmail && <p>Autenticado como: {userEmail}</p>}
      {userRole && <p>Tu rol: {userRole}</p>}
    </div>
  );
}
