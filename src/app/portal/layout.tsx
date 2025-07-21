// src/app/portal/layout.tsx
"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, Auth } from "firebase/auth";
import { doc, getDoc, Firestore } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDB } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  // Inicializa Firebase en cliente
  const initializeFirebaseInstances = useCallback(() => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDB();
      setAuthInstance(auth);
      setDbInstance(db);
      return { auth, db };
    } catch (e: any) {
      console.error("Error al inicializar Firebase en PortalLayout:", e);
      router.replace("/login");
      return { auth: null, db: null };
    }
  }, [router]);

  const handleSessionLogout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Error limpiando sesión en PortalLayout:", error);
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
            const userDocRef = doc(currentDb, "employees", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserRole((userDoc.data()?.role as string) || null);
            } else {
              console.warn("Usuario sin perfil Firestore:", user.uid);
              router.replace("/login");
            }
          } catch (err) {
            console.error("Error al obtener rol del usuario:", err);
            router.replace("/login");
          } finally {
            setLoading(false);
          }
        } else {
          setIsAuthenticated(false);
          setLoading(false);
          handleSessionLogout();
          router.replace("/login");
        }
      });
    } else {
      setLoading(false);
      handleSessionLogout();
      router.replace("/login");
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeFirebaseInstances, handleSessionLogout, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p className="ml-2">Verificando acceso al portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Evita parpadeo innecesario
  }

  return (
    <div>
      <h2>Layout del Portal {userRole ? `(${userRole})` : ""}</h2>
      {children}
    </div>
  );
}
