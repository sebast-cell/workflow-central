// src/app/portal/admin/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase';
import { Auth, User } from 'firebase/auth';
import type { Employee } from '@/lib/api';
import { useRouter } from 'next/navigation'; // <--- ¡AÑADIDO! Importa useRouter

export default function AdminPage() {
  const router = useRouter(); // <--- ¡AÑADIDO! Instancia de useRouter
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

      const fetchUserData = async (currentUser: User) => {
        setUserEmail(currentUser.email);
        try {
          if (db) {
            const userDocRef = doc(db, 'employees', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserRole(userDoc.data()?.role as string);
            } else {
              // Si el usuario de Auth existe pero no tiene perfil en Firestore
              console.warn("Documento de perfil de usuario no encontrado en Firestore para AdminPage:", currentUser.uid);
              // Podrías redirigir o manejar el error aquí
            }
          }
        } catch (err) {
          console.error("Error al obtener datos de usuario para AdminPage:", err);
        } finally {
          setLoading(false);
        }
      };

      if (auth.currentUser) {
        fetchUserData(auth.currentUser);
      } else {
        setLoading(false);
        // Si no hay usuario autenticado al cargar la página, redirige a login
        router.push('/login'); // <--- ¡CAMBIO! Redirige si no hay usuario
      }
    } catch (e) {
      console.error("Error al inicializar Firebase en AdminPage:", e);
      setLoading(false);
      router.push('/login'); // <--- ¡CAMBIO! Redirige en caso de error crítico de Firebase
    }
  }, [router]); // Dependencia en router

  if (loading || !authInstance || !dbInstance) {
    return <p>Cargando datos de administrador...</p>;
  }

  // Comprobación de autenticación y rol
  // Esta lógica se solapa con el middleware, pero es una buena capa defensiva
  if (!authInstance.currentUser) { // <--- ¡CAMBIO! Esta línea es segura si se llega aquí
    // Esto debería ser manejado por el router.push('/login') de arriba
    return <p>No tienes acceso. Por favor inicia sesión.</p>;
  }

  // Opcional: Si quieres asegurar que solo los "Owner" o "Admin" vean esta página
  // if (userRole !== 'Owner' && userRole !== 'Admin') {
  //   router.push('/access-denied'); // O a una página de error
  //   return null;
  // }

  return (
    <div>
      <h1>Página de Administrador</h1>
      <p>Bienvenido al panel de administración.</p>
      {userEmail && <p>Autenticado como: {userEmail}</p>}
      {userRole && <p>Tu rol: {userRole}</p>}
    </div>
  );
}
