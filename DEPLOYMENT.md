# Guía de Despliegue a Producción

¡Felicidades por llegar a esta etapa! Esta guía te ayudará a llevar tu aplicación WorkFlow Central de un entorno de desarrollo a un entorno de producción real para que tus empleados puedan empezar a usarla.

## 1. Concepto Clave: Es una Aplicación Web

A diferencia de una aplicación móvil, esto es una **aplicación web**. No se "descarga" desde una tienda de aplicaciones. En su lugar, la alojarás en un servidor y tus empleados accederán a ella a través de una URL única (ej. `https://tuempresa.com`) desde cualquier navegador web en un ordenador, tablet o móvil.

## 2. Pasos para el Despliegue

Para que la aplicación sea funcional en un entorno real, necesitas tres componentes clave:

1.  **Una Base de Datos:** Para almacenar y persistir los datos de forma segura (empleados, objetivos, etc.).
2.  **Un Sistema de Autenticación:** Para que los usuarios puedan iniciar sesión de forma segura.
3.  **Un Servicio de Hosting:** Para alojar tu aplicación y hacerla accesible en internet.

### Paso 1: Configurar la Base de Datos (Ejemplo con Firestore)

La aplicación está preparada para conectarse a una base de datos. Recomendamos **Firestore** (parte de Firebase de Google) por su facilidad de uso y escalabilidad.

1.  **Crea un Proyecto de Firebase:** Ve a la [consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  **Activa Firestore:** Dentro de tu proyecto, ve a la sección "Firestore Database" y créala en modo "Producción".
3.  **Modela tus Datos:** Firestore organiza los datos en colecciones y documentos. Necesitarás crear colecciones para tus modelos de datos. Las colecciones principales que necesitarás son:
    *   `employees`
    *   `projects`
    *   `objectives`
    *   `tasks`
    *   `incentives`
    *   `settings` (Puedes usar un único documento aquí para guardar toda la configuración, o colecciones separadas como `roles`, `centers`, etc.).
4.  **Genera Credenciales de Servicio:**
    *   En la consola de Firebase, ve a "Configuración del proyecto" > "Cuentas de servicio".
    *   Haz clic en "Generar nueva clave privada". Se descargará un archivo JSON. Guárdalo de forma segura.

### Paso 2: Conectar la API a tu Base de Datos

Ahora, necesitas modificar los archivos de la API en tu proyecto para que lean y escriban en Firestore en lugar de en la base de datos de prueba.

1.  **Instala el SDK de Firebase:**
    ```bash
    npm install firebase-admin
    ```
2.  **Crea un inicializador de Firebase:** Crea un archivo en `src/lib/firebase-admin.ts` para inicializar la conexión con tu base de datos.

    ```typescript
    // src/lib/firebase-admin.ts
    import * as admin from 'firebase-admin';

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    export const firestore = admin.firestore();
    ```

3.  **Actualiza las Rutas de la API:** Modifica cada archivo en `/src/app/api/...` para usar Firestore.

    **Ejemplo: Actualizar `/src/app/api/projects/route.ts`**

    ```typescript
    // ANTES (usando la BD de prueba)
    import { db } from '@/lib/db';
    // ...
    export async function GET() {
        return NextResponse.json(db.projects);
    }
    ```

    ```typescript
    // DESPUÉS (usando Firestore)
    import { NextResponse } from 'next/server';
    import { firestore } from '@/lib/firebase-admin'; // Importa tu cliente de Firestore
    import type { Project } from '@/lib/api';

    export async function GET() {
        // Conecta a tu base de datos real
        const projectsSnapshot = await firestore.collection('projects').get();
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        return NextResponse.json(projects);
    }

    export async function POST(request: Request) {
        const projectData: Omit<Project, 'id'> = await request.json();
        const docRef = await firestore.collection('projects').add(projectData);
        return NextResponse.json({ id: docRef.id, ...projectData }, { status: 201 });
    }
    ```

    **Deberás aplicar este mismo patrón a todas las rutas de la API.**

### Paso 3: Configurar la Autenticación de Usuarios

1.  **Elige un proveedor:** Recomendamos **Firebase Authentication** o **NextAuth.js**.
2.  **Implementa el flujo de inicio de sesión:** Crea las páginas de login, registro y recuperación de contraseña.
3.  **Crea un Contexto de Usuario:** Utiliza un React Context para gestionar la sesión del usuario en toda la aplicación.
4.  **Reemplaza los datos de prueba:** En los archivos donde veas comentarios como `// TODO: Get current user from auth context`, deberás obtener el ID y los datos del usuario desde tu contexto de autenticación en lugar de usar los datos de prueba.

### Paso 4: Variables de Entorno

Para que tu aplicación se conecte de forma segura a los servicios, necesitarás variables de entorno.

1.  Crea un archivo `.env.local` en la raíz de tu proyecto. **Este archivo no debe subirse a tu repositorio de Git.**
2.  Añade tus claves secretas:
    ```env
    # Credenciales de Firebase (del JSON que descargaste)
    FIREBASE_PROJECT_ID="tu-project-id"
    FIREBASE_CLIENT_EMAIL="tu-client-email"
    FIREBASE_PRIVATE_KEY="tu-private-key"

    # Clave de API de Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu-clave-de-google-maps"
    ```
3.  En tu servicio de hosting, busca la sección de "Environment Variables" y añade estas mismas claves.

### Paso 5: Desplegar la Aplicación

Recomendamos usar **Vercel** o **Firebase App Hosting** por su excelente integración con Next.js.

*   **Vercel (Recomendado):**
    1.  Crea una cuenta en [Vercel](https://vercel.com).
    2.  Conecta tu repositorio de Git (GitHub, GitLab, etc.).
    3.  Importa tu proyecto. Vercel lo detectará como un proyecto Next.js y lo configurará automáticamente.
    4.  Añade tus variables de entorno en la configuración del proyecto en Vercel.
    5.  Cada vez que hagas un `git push`, Vercel desplegará automáticamente los cambios.

*   **Firebase App Hosting:**
    1.  Instala las herramientas de Firebase: `npm install -g firebase-tools`.
    2.  Inicia sesión: `firebase login`.
    3.  Inicializa Firebase en tu proyecto: `firebase init hosting`. Selecciona "App Hosting" y sigue los pasos.
    4.  Despliega con: `firebase deploy`.

### Paso 6: ¡Comparte la URL!

Una vez desplegada, tu proveedor de hosting te dará una URL pública. ¡Esa es la dirección que puedes compartir con tus empleados para que empiecen a usar la aplicación!
