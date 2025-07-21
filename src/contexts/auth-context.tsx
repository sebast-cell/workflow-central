'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';
import { type User, onAuthStateChanged, signOut, Auth } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase';
import type { Employee } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface AuthContextType {
  user: Employee | null;
  firebaseUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (employeeData: Employee) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.error('Error al inicializar Firebase en AuthProvider:', e);
      setError('Error crítico de Firebase: ' + e.message);
      setIsLoading(false);
      return { auth: null, db: null };
    }
  }, []);

  const fetchUserRoleAndData = useCallback(
    async (fbUser: User) => {
      if (!dbInstance) {
        console.error('Firestore DB no disponible para fetchUserRoleAndData.');
        setError('Servicio de base de datos no disponible.');
        return;
      }
      try {
        const docRef = doc(dbInstance, 'employees', fbUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const employeeData = docSnap.data() as Omit<Employee, 'id' | 'uid'>;
          const fullEmployeeProfile: Employee = {
            id: docSnap.id,
            uid: fbUser.uid,
            ...employeeData,
          };
          setUser(fullEmployeeProfile);
        } else {
          console.warn(
            'Perfil de empleado no encontrado en Firestore para UID:',
            fbUser.uid
          );
          setError('Perfil de usuario no encontrado.');
          setUser(null);
          if (authInstance) await signOut(authInstance);
        }
      } catch (error: any) {
        console.error('Error fetching user data from Firestore:', error);
        setError('Error al cargar perfil de usuario: ' + error.message);
        setUser(null);
        if (authInstance) await signOut(authInstance);
      }
    },
    [dbInstance, authInstance]
  );

  const login = useCallback((employeeData: Employee) => {
    setUser(employeeData);
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (authInstance) {
        await signOut(authInstance);
      }
      await axios.post('/api/auth/logout').catch(() => {
        /* ignora error */
      });
    } finally {
      setUser(null);
      setFirebaseUser(null);
      setIsLoading(false);
    }
  }, [authInstance]);

  useEffect(() => {
    const { auth: currentAuth } = initializeFirebaseInstances();

    if (!currentAuth) {
      // Si no hay instancia de Firebase Auth, no seguimos
      console.error('No se pudo inicializar Firebase Auth.');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(currentAuth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        if (!user || user.uid !== fbUser.uid) {
          await fetchUserRoleAndData(fbUser);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeFirebaseInstances, fetchUserRoleAndData]);

  const isAuthenticated = useMemo(
    () => !!user && !!firebaseUser,
    [user, firebaseUser]
  );

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
    }),
    [user, firebaseUser, isAuthenticated, isLoading, error, login, logout]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Cargando autenticación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col text-red-600">
        <p className="font-bold">Error de autenticación</p>
        <p>{error}</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
