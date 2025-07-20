// src/lib/firebase-admin.ts
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Servicio: se toma la clave JSON desde la variable de entorno FIREBASE_SERVICE_ACCOUNT
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

let adminApp: App;

if (!getApps().length) {
  if (serviceAccountKey) {
    try {
      const parsedServiceAccount = JSON.parse(
        serviceAccountKey.replace(/\\n/g, '\n')
      );
      adminApp = initializeApp({
        credential: cert(parsedServiceAccount),
      });
      console.log("Firebase Admin SDK inicializado con credenciales.");
    } catch (error) {
      console.error("Error al inicializar Firebase Admin SDK con credenciales:", error);
      adminApp = initializeApp();
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT no configurado. Firebase Admin SDK inicializado sin credenciales.");
    adminApp = initializeApp();
  }
} else {
  adminApp = getApp();
}

// Exporta Auth y DB
export const auth: Auth = getAuth(adminApp);
export const db: Firestore = getFirestore(adminApp);
