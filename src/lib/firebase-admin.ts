import * as admin from 'firebase-admin';

// --- INICIO DE CÓDIGO DE DEPURACIÓN ---
// Este código nos mostrará en los logs de Vercel si las variables de entorno se están leyendo.
console.log('--- Depurando Firebase Admin SDK ---');
console.log('¿Existe FIREBASE_PROJECT_ID?', !!process.env.FIREBASE_PROJECT_ID);
console.log('¿Existe FIREBASE_CLIENT_EMAIL?', !!process.env.FIREBASE_CLIENT_EMAIL);
console.log('¿Existe FIREBASE_PRIVATE_KEY?', !!process.env.FIREBASE_PRIVATE_KEY);
// --- FIN DE CÓDIGO DE DEPURACIÓN ---

// Evita la reinicialización en entornos de desarrollo con hot-reloading
if (!admin.apps.length) {
  try {
    console.log('Intentando inicializar Firebase Admin...');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
    console.log('¡Firebase Admin inicializado con éxito!');
  } catch (error: any) {
    console.error('ERROR FATAL al inicializar Firebase Admin SDK:', error.message);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
