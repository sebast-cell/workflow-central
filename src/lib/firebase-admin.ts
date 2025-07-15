import * as admin from 'firebase-admin';

console.log('--- Depurando Firebase Admin SDK ---');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NO DEFINIDO');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL || 'NO DEFINIDO');
console.log('FIREBASE_PRIVATE_KEY existe:', !!process.env.FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  try {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error('Faltan variables de entorno para Firebase Admin');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });

    console.log('✅ Firebase Admin inicializado con éxito!');
  } catch (error: any) {
    console.error('🚨 ERROR FATAL al inicializar Firebase Admin SDK:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
