// src/app/portal/empleado/page.tsx
"use client"; // <--- ¡CRÍTICO! Emoĩ ko'ãva Client Component ramo

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; // Emoĩ doc ha getDoc SDK CLIENTE-gui
import { getFirebaseAuth, getFirebaseDB } from '@/lib/firebase'; // <--- ¡CAMBIO KO'ÁPE! Emoĩ función-kuéra

export default function EmpleadoPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase instancia-kuéra ojehupytýva condicionalmente
  const [authInstance, setAuthInstance] = useState<any>(null); // Ikatu ha'e tipo Auth
  const [dbInstance, setDbInstance] = useState<any>(null);   // Ikatu ha'e tipo Firestore

  useEffect(() => {
    try {
      const auth = getFirebaseAuth(); // Ejapo Auth instancia
      const db = getFirebaseDB();     // Ejapo DB instancia
      setAuthInstance(auth);
      setDbInstance(db);

      const fetchUserData = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserEmail(currentUser.email);
          try {
            if (db) { // Ejesareko db oĩporãpa
              const userDocRef = doc(db, 'employees', currentUser.uid); // <--- ¡CAMBIO KO'ÁPE! Colección 'employees'
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                setUserRole(userDoc.data()?.role as string);
              }
            }
          } catch (err) {
            console.error("Error ojejapo jave usuario rembiapokue EmpleadoPage-pe:", err);
          }
        }
        setLoading(false);
      };
      fetchUserData();
    } catch (e) {
      console.error("Error oñepyrũ jave Firebase EmpleadoPage-pe:", e);
      setLoading(false); // Ndojapoivéi carga oĩramo jepe error
    }
  }, []); // Dependencia vacía ojejapo hag̃ua peteĩ jey

  if (loading || !authInstance || !dbInstance) { // Ohechauka carga oĩramo instancia-kuéra ndoĩporãi
    return <p>Ojejapo jave empleado rembiapokue...</p>;
  }

  return (
    <div>
      <h1>Empleado rembiapokue</h1>
      <p>Nde bienvenida empleado portal-pe.</p>
      {userEmail && <p>Oñembohekóva: {userEmail}</p>}
      {userRole && <p>Nde rol: {userRole}</p>}
      {/* Ko'ápe oho ambue UI componente-kuéra empleado-pe guarã */}
    </div>
  );
}
