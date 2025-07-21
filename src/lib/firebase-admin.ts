// src/lib/firebase-admin.ts
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT no configurado en el entorno.");
  }
  try {
    const parsedServiceAccount = JSON.parse(
      serviceAccountKey.replace(/\\n/g, '\n')
    );
    adminApp = initializeApp({
      credential: cert(parsedServiceAccount),
    });
    console.log("✅ Firebase Admin SDK inicializado con credenciales del .env");
  } catch (error) {
    console.error("❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:", error);
    throw new Error("No se pudo inicializar Firebase Admin SDK");
  }
} else {
  adminApp = getApp();
}

export const auth: Auth = getAuth(adminApp);
export const db: Firestore = getFirestore(adminApp);
