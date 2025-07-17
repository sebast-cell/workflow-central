// src/lib/firebase-admin.ts
// Este archivo inicializa el SDK de Firebase Admin para ser usado en entornos de servidor (Node.js)
// como API Routes de Next.js, middleware, y scripts de backend.

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app'; // Importa 'App' para tipado
import { getAuth, Auth } from 'firebase-admin/auth'; // Importa 'Auth' para tipado
import { getFirestore, Firestore } from 'firebase-admin/firestore'; // Importa 'Firestore' para tipado

// La clave de servicio JSON se obtiene de la variable de entorno FIREBASE_SERVICE_ACCOUNT.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

// Función para obtener o inicializar la app de Firebase Admin
function getAdminApp(): App {
  if (getApps().length === 0) {
    // Si no hay apps inicializadas, intentamos inicializarla
    if (!serviceAccountKey) {
      console.warn("FIREBASE_SERVICE_ACCOUNT no configurado. Inicializando Admin SDK sin credenciales.");
      // Inicializa sin credenciales si no hay serviceAccountKey (útil para desarrollo local sin setup completo)
      return initializeApp();
    }
    try {
      // Intenta inicializar con las credenciales del secreto
      const parsedServiceAccount = JSON.parse(
        serviceAccountKey.replace(/\\n/g, '\n') // Reemplaza \n escapados por saltos de línea reales
      );
      console.log("Firebase Admin SDK inicializado con credenciales.");
      return initializeApp({
        credential: cert(parsedServiceAccount),
      });
    } catch (error) {
      console.error("Error al inicializar Firebase Admin SDK con credenciales:", error);
      console.warn("Inicializando Admin SDK sin credenciales debido a un error.");
      // Si falla el parseo o las credenciales, inicializa sin ellas
      return initializeApp();
    }
  } else {
    // Si ya hay apps inicializadas, devuelve la instancia por defecto
    return getApp();
  }
}

// Inicializa la app de Admin una vez y la almacena
const adminAppInstance = getAdminApp();

// Exporta las instancias de Auth y Firestore del SDK Admin
// Los servicios serán null si adminAppInstance no pudo inicializarse (ej. sin credenciales)
export const auth: Auth | null = adminAppInstance ? getAuth(adminAppInstance) : null;
export const db: Firestore | null = adminAppInstance ? getFirestore(adminAppInstance) : null;
