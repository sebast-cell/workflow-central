// src/app/portal/layout.tsx
"use client";

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, Auth } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase';
import type { Employee } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  const initializeFirebaseInstances = useCallback(() => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDB();
      setAuthInstance(auth);
      setDbInstance(db);
      return { auth, db };
    } catch (e: any) {
      console.error("Error al inicializar Firebase en PortalLayout:", e);
      router.push('/login'); // Redirige si Firebase no se puede inicializar
      return { auth: null, db: null };
    }
  }, [router]);

  const handleSessionLogout = useCallback(async () => {
      try {
        await axios.post('/api/auth/logout');
      } catch (error) {
        console.error("Failed to clear session cookie on portal layout:", error);
      }
  }, []);

  useEffect(() => {
    const { auth: currentAuth, db: currentDb } = initializeFirebaseInstances();
    
    let unsubscribe: (() => void) | undefined;
    if (currentAuth && currentDb) {
      unsubscribe = onAuthStateChanged(currentAuth, async (user) => {
        if (user) {
          setIsAuthenticated(true);
          setLoading(true);
          try {
            const userDocRef = doc(currentDb, 'employees', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserRole(userDoc.data()?.role as string);
            } else {
              console.warn("Documento de rol no encontrado para UID:", user.uid);
              router.push('/login');
            }
          } catch (err) {
            console.error("Error al obtener rol del usuario:", err);
            router.push('/login');
          } finally {
            setLoading(false);
          }
        } else {
          setIsAuthenticated(false);
          setLoading(false);
          handleSessionLogout();
          router.push('/login');
        }
      });
    } else {
      setLoading(false);
      handleSessionLogout();
      router.push('/login');
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router, initializeFirebaseInstances, handleSessionLogout]);

  if (loading || !authInstance || !dbInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p className="ml-2">Verificando acceso al portal...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Layout del Portal ({userRole})</h2>
        {children}
      </div>
    );
  }

  return null;
}
