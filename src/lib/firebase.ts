// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export function getFirebaseApp() {
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
export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDB() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseAnalytics() {
  return getAnalytics(getFirebaseApp());
}

// --- NOTA IMPORTANTE PARA EL USO EN COMPONENTES ---
// En tus componentes de React (que sean Client Components),
// debes llamar a estas funciones dentro de un useEffect o en un manejador de eventos.
// Ejemplo:
// "use client";
// import { useEffect, useState } from "react";
// import { getFirebaseAuth, getFirebaseDB } from "@/lib/firebase";
//
// export default function MyComponent() {
//   const [authInstance, setAuthInstance] = useState(null);
//   const [dbInstance, setDbInstance] = useState(null);
//
//   useEffect(() => {
//     setAuthInstance(getFirebaseAuth());
//     setDbInstance(getFirebaseDB());
//   }, []);
//
//   if (!authInstance || !dbInstance) {
//     return <p>Cargando Firebase...</p>;
//   }
//
//   return <div>Hola Firebase!</div>;
// }
