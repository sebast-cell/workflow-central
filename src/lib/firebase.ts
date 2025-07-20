// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Objeto de configuración
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Devuelve la instancia de la app, solo en cliente
export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseApp solo debe llamarse en el cliente.");
  }
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

// Devuelve la instancia de Auth, solo en cliente
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

// Devuelve la instancia de Firestore, solo en cliente
export function getFirebaseDB(): Firestore {
  return getFirestore(getFirebaseApp());
}

// Devuelve la instancia de Analytics, solo en cliente y solo si window está definido
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null;
  return getAnalytics(getFirebaseApp());
}
