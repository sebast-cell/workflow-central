// src/lib/firebase-admin.ts
// Este archivo inicializa el SDK de Firebase Admin para ser usado en entornos de servidor (Node.js)
// como API Routes de Next.js, middleware, y scripts de backend.

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app'; // Eliminado 'cert'
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Las credenciales se obtienen automáticamente del entorno de Google Cloud (ADC).
// No necesitamos las variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY aquí.

let adminApp: App; // Declara 'app' con tipo 'App'

// Asegura que la app de Firebase Admin se inicialice una sola vez y de forma robusta.
if (!getApps().length) {
  try {
    // applicationDefault() busca automáticamente las credenciales del entorno de Google Cloud.
    adminApp = initializeApp(); // <--- ¡CAMBIO CLAVE! Inicializa sin argumentos para usar ADC
    console.log("Firebase Admin SDK inicializado con Credenciales Predeterminadas de la Aplicación (ADC).");
  } catch (error) {
    console.error("Error al inicializar Firebase Admin SDK con ADC:", error);
    throw new Error("Error crítico al inicializar Firebase Admin SDK. Asegúrate de que la cuenta de servicio de Cloud Run tenga los roles de Firebase adecuados.");
  }
} else {
  // Si la app ya está inicializada (ej. en una invocación "cálida" de la función),
  // obtenemos la instancia por defecto.
  adminApp = getApp();
}

// Exporta las instancias de Auth y Firestore del SDK Admin.
// Con la lógica de arriba, estas nunca serán nulas si el build es exitoso.
export const auth: Auth = getAuth(adminApp);
export const db: Firestore = getFirestore(adminApp);