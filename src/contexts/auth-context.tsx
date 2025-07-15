'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client'; // Asegúrate de que la ruta sea correcta

// Definimos la estructura de los datos del usuario que guardaremos de Firestore
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Employee';
  department?: string;
  // Añade aquí cualquier otro campo del perfil que necesites
}

// Definimos lo que nuestro contexto va a proveer
interface AuthContextType {
  user: User | null; // El objeto de usuario de Firebase Auth
  userData: UserProfile | null; // Nuestro perfil de usuario de Firestore
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos el componente Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es un listener que se ejecuta cada vez que el estado de auth cambia
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si el usuario ha iniciado sesión, guardamos su info de Auth
        setUser(firebaseUser);
        
        // Y buscamos su perfil en nuestra base de datos de Firestore
        const userDocRef = doc(db, 'employees', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Si encontramos el documento, guardamos los datos del perfil
          setUserData({ uid: firebaseUser.uid, ...userDocSnap.data() } as UserProfile);
        } else {
          // Caso de error: el usuario existe en Auth pero no en Firestore
          console.error("Error: No se encontró el perfil del usuario en Firestore.");
          setUserData(null);
        }
      } else {
        // Si el usuario ha cerrado sesión, limpiamos los estados
        setUser(null);
        setUserData(null);
      }
      // Terminamos de cargar
      setLoading(false);
    });

    // Devolvemos la función de limpieza para que el listener se elimine cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const value = { user, userData, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
