
// src/lib/firebase-admin.ts
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminAppInstance: App | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (getApps().length === 0) {
    if (serviceAccountKey) {
      const parsedServiceAccount = JSON.parse(
        serviceAccountKey.replace(/\\n/g, '\n')
      );
      adminAppInstance = initializeApp({
        credential: cert(parsedServiceAccount),
      });
      console.log("Firebase Admin SDK initialized with credentials.");
    } else {
      // This path is for environments where you might rely on default credentials
      // (like Google Cloud Functions/Run) or for local dev without the env var set.
      // It will likely have limited permissions if no other config is available.
      adminAppInstance = initializeApp();
      console.warn("FIREBASE_SERVICE_ACCOUNT not set. Initializing Admin SDK with default credentials. This may have limited permissions.");
    }
  } else {
    adminAppInstance = getApp();
  }

  if (adminAppInstance) {
    authInstance = getAuth(adminAppInstance);
    dbInstance = getFirestore(adminAppInstance);
  }

} catch (error: any) {
  // Catch parsing or initialization errors
  console.error("Failed to initialize Firebase Admin SDK:", error.message);
  // Ensure instances are null if initialization fails
  adminAppInstance = null;
  authInstance = null;
  dbInstance = null;
}

// Export the potentially null instances
export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;
