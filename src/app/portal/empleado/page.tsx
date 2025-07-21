"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase';
import { Auth, User } from 'firebase/auth';

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

      const fetchUserData = async (currentUser: User) => {
        setUserEmail(currentUser.email);
        try {
          const userDocRef = doc(db, 'employees', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data()?.role as string);
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
        // Si quieres redirigir al login en caso de no autenticado:
        // router.push('/login');
      }
    } catch (e) {
      console.error("Error al inicializar Firebase en AdminPage:", e);
      setLoading(false);
    }
  }, []);

  if (loading || !authInstance || !dbInstance) {
    return <p>Cargando datos de administrador...</p>;
  }

  if (!authInstance.currentUser) {
    return <p>No tienes acceso. Por favor inicia sesión.</p>;
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
