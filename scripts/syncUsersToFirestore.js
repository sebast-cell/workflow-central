/**
 * @fileoverview Syncs Firebase Authentication users to the Firestore `employees` collection.
 *
 * This script iterates through all users in Firebase Authentication and ensures
 * that a corresponding document exists in the `employees` collection in Firestore.
 * The Firestore document ID is set to be the same as the user's UID from Authentication.
 *
 * If a document already exists, it will be updated (merged) with the latest
 * information from Auth. If it doesn't exist, it will be created.
 *
 * Default role assigned is 'Employee'. This script specifically assigns 'Owner'
 * to the designated OWNER_EMAIL.
 */

// Para ejecutar este script, necesitas tener Firebase Admin SDK configurado.
// 1. Instala los paquetes necesarios: npm install firebase-admin
// 2. Configura la autenticación: https://firebase.google.com/docs/admin/setup
//    - Para desarrollo local, descarga el archivo JSON de la clave de cuenta de servicio.
//    - Configura la variable de entorno:
//      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
// 3. Configura el email del usuario que quieres que sea el Owner:
//    export OWNER_EMAIL="owner@example.com"
// 4. Ejecuta el script: node scripts/syncUsersToFirestore.js

// Usa require para importar los módulos (CommonJS, para scripts de Node.js)
const admin = require('firebase-admin'); // Importa el módulo admin completo

// Inicializa Firebase Admin SDK.
// Usará automáticamente la variable de entorno GOOGLE_APPLICATION_CREDENTIALS.
if (!admin.apps.length) {
  try {
    // applicationDefault() busca GOOGLE_APPLICATION_CREDENTIALS o credenciales de entorno.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // <--- ¡CAMBIO AQUÍ! Uso correcto de applicationDefault
    });
    console.log('Firebase Admin SDK inicializado.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed.', error);
    console.log('Asegúrate de que tus credenciales de cuenta de servicio estén configuradas correctamente (GOOGLE_APPLICATION_CREDENTIALS).');
    process.exit(1);
  }
}

const auth = admin.auth(); // Accede a auth a través de la instancia admin
const firestore = admin.firestore(); // Accede a firestore a través de la instancia admin

// El email del usuario que debe ser el Owner.
const OWNER_EMAIL = "aluminiosmediterraneo@gmail.com";

if (!OWNER_EMAIL) {
    console.error("Error: La variable de entorno OWNER_EMAIL no está configurada.");
    console.log("Por favor, configura la dirección de correo electrónico del usuario que quieres designar como Owner.");
    console.log("Ejemplo: export OWNER_EMAIL=\"tu-correo@ejemplo.com\"");
    process.exit(1);
}

async function syncAllUsersToFirestore() {
  console.log('Starting synchronization of Auth users to Firestore...');
  console.log(`Designated Owner Email: ${OWNER_EMAIL}`);
  let pageToken;

  try {
    do {
      const listUsersResult = await auth.listUsers(1000, pageToken);

      if (listUsersResult.users.length === 0) {
        console.log('No users found in Firebase Authentication.');
        break;
      }

      const promises = listUsersResult.users.map(async (userRecord) => {
        const { uid, email, displayName } = userRecord;
        // ¡CRÍTICO! Usa la colección 'employees' (PLURAL)
        const employeeDocRef = firestore.collection('employees').doc(uid); 
        
        console.log(`- Processing user: ${email || 'No Email'} (UID: ${uid})`);

        try {
          // Determina el rol basado en la dirección de correo electrónico
          // ¡CRÍTICO! Asigna 'Owner' al correo designado
          const role = email === OWNER_EMAIL ? 'Owner' : 'Employee'; 
          
          let avatarInitials = 'U';
          if (displayName) {
             const nameParts = displayName.trim().split(' ').filter(Boolean);
             if (nameParts.length > 0) {
                avatarInitials = nameParts[0][0].toUpperCase();
             }
          } else if (email) {
             avatarInitials = email[0].toUpperCase();
          }

          const employeeData = {
              uid, // Almacenando uid dentro del documento para facilitar las consultas
              email: email || '',
              name: displayName || email?.split('@')[0] || 'Unnamed User',
              role: role, // ¡Aquí se asigna el rol!
              status: 'Activo', // Estado por defecto
              department: 'Sin Asignar', // Departamento por defecto
              schedule: 'No Definido', // Horario por defecto
              phone: '',
              hireDate: new Date().toISOString().split('T')[0],
              avatar: avatarInitials,
              createdAt: admin.firestore.Timestamp.now(), // <--- ¡CAMBIO AQUÍ! Timestamp del servidor
          };

          // Usa set con { merge: true } para crear o actualizar el documento
          // sin sobrescribir campos existentes que quieras mantener (como 'role' si se estableció manualmente).
          await employeeDocRef.set(employeeData, { merge: true });
          console.log(`  - Synced ${email} with role: ${role}`);

        } catch (docError) {
          console.error(`  - Failed to write document for UID: ${uid}`, docError);
        }
      });

      await Promise.all(promises);

      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    console.log('\n✅ Synchronization complete!');
  } catch (error) {
    console.error('Error listing users or during synchronization:', error);
  }
}

syncAllUsersToFirestore();
