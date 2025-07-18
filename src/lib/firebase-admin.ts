// src/lib/firebase-admin.ts
// Este archivo inicializa el SDK de Firebase Admin para entornos de servidor (Node.js)
// como API Routes de Next.js, middleware, y scripts de backend.

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Clave de servicio JSON obtenida de la variable de entorno FIREBASE_SERVICE_ACCOUNT.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

// Función para inicializar o reutilizar la app de Admin
function getAdminApp(): App {
  if (getApps().length === 0) {
    if (!serviceAccountKey) {
      console.warn("FIREBASE_SERVICE_ACCOUNT no configurado. Inicializando Admin SDK sin credenciales.");
      return initializeApp();
    }
    try {
      const parsedServiceAccount = JSON.parse(
        serviceAccountKey.replace(/\\n/g, '\n')
      );
      console.log("Firebase Admin SDK inicializado con credenciales.");
      return initializeApp({
        credential: cert(parsedServiceAccount),
      });
    } catch (error) {
      console.error("Error al inicializar Firebase Admin SDK:", error);
      console.warn("Inicializando Admin SDK sin credenciales debido a un error.");
      return initializeApp();
    }
  } else {
    return getApp();
  }
}

// Inicializa la app una sola vez
const adminAppInstance = getAdminApp();

// Exporta las instancias que usarás en tus rutas API y lógica backend
export const auth: Auth | null = adminAppInstance ? getAuth(adminAppInstance) : null;
export const db: Firestore | null = adminAppInstance ? getFirestore(adminAppInstance) : null;
