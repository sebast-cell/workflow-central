import * as admin from 'firebase-admin';

// Declaramos las variables que vamos a exportar
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;

try {
  // Comprobamos si la app ya está inicializada para evitar errores
  if (!admin.apps.length) {
    console.log('--- Intentando inicializar Firebase Admin SDK ---');
    
    // Verificamos que las variables de entorno existan antes de usarlas
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Las variables de entorno de Firebase Admin no están definidas.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Esta línea es CRUCIAL para que Vercel interprete la clave privada correctamente
        privateKey: (process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n'),
      }),
    });
    console.log('--- ¡Firebase Admin SDK inicializado con éxito! ---');
  }

  // Asignamos los servicios a las variables que exportaremos
  adminAuth = admin.auth();
  adminDb = admin.firestore();

} catch (error: any) {
  // Si algo falla en cualquier punto, lo capturamos y lo mostramos
  console.error('--- ERROR FATAL AL INICIALIZAR FIREBASE ADMIN SDK ---');
  console.error(error.message);
  // Lanzamos un error para detener el proceso de build y que el fallo sea visible
  throw new Error('No se pudo inicializar Firebase Admin SDK. Revisa los logs del servidor y las variables de entorno en Vercel.');
}

// Exportamos los servicios ya listos para usar
export { adminAuth, adminDb };
