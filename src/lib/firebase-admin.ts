// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Evita la reinicialización en entornos de desarrollo con hot-reloading
if (!admin.apps.length) {
  try {
    // When deployed on App Hosting, the Admin SDK is automatically
    // configured. No arguments are needed for initializeApp().
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth();
