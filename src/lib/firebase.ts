
// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// --- SOLUCIÓN: Exportar funciones que inicializan condicionalmente ---

// Función para obtener la instancia de la app de Firebase
export function getFirebaseApp(): FirebaseApp {
  // Asegura que esta función solo se llame en el lado del cliente (navegador)
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp should only be called client-side.");
  }
  // Inicializa la app si no ha sido inicializada ya
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  // Si ya está inicializada, devuelve la instancia existente
  return getApp();
}

// Funciones para obtener las instancias de los servicios de Firebase
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDB(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") {
    return null;
  }
  return getAnalytics(getFirebaseApp());
}
