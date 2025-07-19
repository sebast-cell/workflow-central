
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type Employee, listEmployees } from '@/lib/api';

interface AuthContextType {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: Employee) => void;
  logout: () => void;
  fetchUser: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to load the user from localStorage.
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: Employee) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  }, []);

  const fetchUser = useCallback(async (uid: string) => {
      try {
        // In a real high-performance app, you'd have a `getEmployee(uid)` endpoint
        const allEmployees = await listEmployees();
        const foundUser = allEmployees.find(e => e.id === uid);
        if (foundUser) {
            login(foundUser);
        } else {
            throw new Error("User profile not found in Firestore.");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        logout(); // Log out if profile can't be fetched
      }
  }, [login, logout]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
