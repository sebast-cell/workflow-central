// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;


if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
    }
} else if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
    }
}

// Export instances directly for client-side usage
// The check above ensures they are only initialized on the client
export { app, auth, db, analytics };

// --- NOTA IMPORTANTE PARA EL USO EN COMPONENTES ---
// En tus componentes de React (que sean Client Components),
// ya puedes importar `auth` y `db` directamente.
// Ejemplo:
// "use client";
// import { auth, db } from "@/lib/firebase";
//
// export default function MyComponent() {
//   // Ya no es necesario usar useState y useEffect para la inicialización
//
//   // Puedes usar auth y db directamente
//
//   return <div>Hola Firebase!</div>;
// }
