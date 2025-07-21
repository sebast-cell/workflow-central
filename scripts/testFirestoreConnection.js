// scripts/testFirestoreConnection.js
// ✅ Carga las variables de entorno del .env.local o .env
require('dotenv').config({ path: '.env.local' }); // <-- Asegúrate que el archivo existe y contiene FIREBASE_SERVICE_ACCOUNT

const admin = require('firebase-admin');

function initFirebaseAdmin() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    throw new Error('❌ FIREBASE_SERVICE_ACCOUNT no está definido en el entorno.');
  }

  let parsed;
  try {
    parsed = JSON.parse(serviceAccount);
  } catch (err) {
    console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:', err);
    throw err;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
    console.log('✅ Firebase Admin inicializado correctamente.');
  }

  return admin.firestore();
}

async function testConnection() {
  try {
    const db = initFirebaseAdmin();

    // Simple prueba: lee la primera colección
    const snapshot = await db.collection('employees').limit(1).get();
    if (snapshot.empty) {
      console.log('✅ Conectado correctamente, pero no hay documentos en "employees".');
    } else {
      snapshot.forEach(doc => {
        console.log('✅ Conectado y leído documento:', doc.id, doc.data());
      });
    }
  } catch (err) {
    console.error('❌ Error al conectar a Firestore:', err);
  }
}

testConnection();
