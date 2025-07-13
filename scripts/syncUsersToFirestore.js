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
 * Default role assigned is 'Employee'. You can modify this script to assign
 * different roles based on specific logic (e.g., based on email domain).
 */

// To run this script, you need to have Firebase Admin SDK configured.
// 1. Install necessary packages: npm install firebase-admin
// 2. Set up authentication: https://firebase.google.com/docs/admin/setup
//    - For local development, you might need a service account key JSON file.
//    - Set the GOOGLE_APPLICATION_CREDENTIALS environment variable:
//      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
// 3. Run the script: node scripts/syncUsersToFirestore.js

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK.
// It will automatically use the GOOGLE_APPLICATION_CREDENTIALS environment
// variable if it's set.
try {
  initializeApp({
    credential: applicationDefault(),
  });
} catch (error) {
  console.error('Firebase Admin SDK initialization failed.', error);
  console.log('Please ensure you have configured your service account credentials correctly.');
  process.exit(1);
}


const auth = getAuth();
const firestore = getFirestore();

async function syncAllUsersToFirestore() {
  console.log('Starting synchronization of Auth users to Firestore...');
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
        const employeeDocRef = firestore.collection('employees').doc(uid);
        
        console.log(`- Processing user: ${email || 'No Email'} (UID: ${uid})`);

        try {
          // Use set with { merge: true } to create or update the document
          // without overwriting existing fields you want to keep (like 'role').
          await employeeDocRef.set(
            {
              uid, // Storing uid inside the doc as well for easier queries
              email: email || '',
              name: displayName || email?.split('@')[0] || 'Unnamed User',
              // IMPORTANT: This logic sets 'Admin' role for a specific email
              // and 'Empleado' for everyone else. Customize as needed.
              role: email === 'aluminiosmediterraneo@gmail.com' ? 'Admin' : 'Empleado',
              status: 'Activo', // Default status
              department: 'Sin Asignar', // Default department
              avatar: (displayName || email || 'U')[0].toUpperCase(),
            },
            { merge: true } // This is crucial! It prevents overwriting the role if already set.
          );
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
