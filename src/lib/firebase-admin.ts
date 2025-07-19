// src/lib/firebase-admin.ts
// Este archivo inicializa el SDK de Firebase Admin para ser usado en entornos de servidor (Node.js)
// como API Routes de Next.js, middleware, y scripts de backend.

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// La clave de servicio JSON se obtiene de la variable de entorno FIREBASE_SERVICE_ACCOUNT.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

let adminApp: App;

// Evita la reinicialización en entornos de desarrollo con hot-reloading
if (!getApps().length) {
  if (serviceAccountKey) {
    try {
      const parsedServiceAccount = JSON.parse(
        serviceAccountKey.replace(/\\n/g, '\n') // Reemplaza \n escapados por saltos de línea reales
      );
      adminApp = initializeApp({
        credential: cert(parsedServiceAccount),
      });
      console.log("Firebase Admin SDK inicializado con credenciales.");
    } catch (error) {
      console.error("Error al inicializar Firebase Admin SDK con credenciales:", error);
      console.warn("Intentando inicializar Firebase Admin SDK sin credenciales (solo para ciertas operaciones o desarrollo).");
      adminApp = initializeApp();
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT no configurado. Firebase Admin SDK inicializado sin credenciales.");
    adminApp = initializeApp();
  }
} else {
  adminApp = getApp();
}

export const auth: Auth | null = adminApp ? getAuth(adminApp) : null;
export const db: Firestore | null = adminApp ? getFirestore(adminApp) : null;
