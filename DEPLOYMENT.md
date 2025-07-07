# Guía de Despliegue a Producción Detallada

¡Felicidades por llegar a esta etapa! Esta guía te ayudará a llevar tu aplicación WorkFlow Central de un entorno de desarrollo con datos de prueba a un entorno de producción real para que tus empleados puedan empezar a usarla.

## 1. Conceptos Clave

*   **Aplicación Web:** A diferencia de una app móvil, esta es una aplicación web. No se descarga de una tienda. Se aloja en un servidor y se accede a ella a través de una URL (ej. `https://tuempresa.com`) en un navegador.
*   **Frontend y Backend:** Aunque están en el mismo proyecto, tu aplicación tiene dos partes:
    *   **Frontend (React/Next.js):** Lo que el usuario ve y con lo que interactúa.
    *   **Backend (Next.js API Routes):** La lógica que se ejecuta en el servidor, se conecta a la base de datos y gestiona los datos.
*   **Entorno de Producción:** Un entorno real que utiliza servicios en la nube (base de datos, autenticación, hosting) para ser accesible, seguro y escalable.

## 2. Los 3 Pilares del Despliegue

Para que la aplicación sea funcional, necesitas tres componentes clave:

1.  **Una Base de Datos:** Para almacenar y persistir los datos de forma segura (empleados, objetivos, etc.).
2.  **Un Sistema de Autenticación:** Para que los usuarios puedan iniciar sesión de forma segura.
3.  **Un Servicio de Hosting:** Para alojar tu aplicación y hacerla accesible en internet.

---

### **Paso 1 (Detallado): Configurar la Base de Datos con Firestore**

Tu aplicación necesita un lugar donde guardar la información de forma permanente. Usaremos Firestore, la base de datos de Firebase.

1.  **Crea un Proyecto en Firebase:**
    *   Ve a la [Consola de Firebase](https://console.firebase.google.com/).
    *   Haz clic en "Crear un proyecto" y dale un nombre (ej. "WorkFlow Central"). Acepta los términos y continúa. Puedes deshabilitar Google Analytics para este proyecto si lo deseas.

2.  **Activa Firestore:**
    *   Dentro del panel de tu nuevo proyecto, en el menú de la izquierda, ve a `Construir > Firestore Database`.
    *   Haz clic en "Crear base de datos".
    *   **IMPORTANTE:** Selecciona el modo **Producción** (empieza en modo bloqueado por seguridad).
    *   Elige una ubicación para tus servidores de base de datos. Selecciona la que esté más cerca de la mayoría de tus usuarios (ej. `europe-west` para Europa).

3.  **Crea las Colecciones Iniciales:**
    *   Firestore organiza los datos en "colecciones" (piensa en ellas como carpetas) que contienen "documentos". Necesitas crear las colecciones principales para que tu aplicación tenga dónde guardar los datos.
    *   En la pestaña "Datos" de Firestore, haz clic en "+ Iniciar colección" y crea las siguientes (puedes dejarlas vacías por ahora, la app las llenará):
        *   `employees`
        *   `projects`
        *   `objectives`
        *   `tasks`
        *   `incentives`
        *   `settings` (Dentro de esta, puedes crear un documento inicial llamado `main` para guardar configuraciones generales).

4.  **Genera las Credenciales de Servicio (La Llave Secreta):**
    *   En la esquina superior izquierda, haz clic en el engranaje (a la derecha de "Project Overview") y selecciona "Configuración del proyecto".
    *   Ve a la pestaña "Cuentas de servicio".
    *   Asegúrate de que "Firebase Admin SDK" está seleccionado y haz clic en el botón **"Generar nueva clave privada"**.
    *   Se descargará un archivo JSON. **Guarda este archivo en un lugar seguro y no lo compartas públicamente.** Contiene las claves que le dan a tu aplicación acceso total a tu base de datos.

---

### **Paso 2 (Detallado): Conectar la Aplicación a Firestore**

Ahora le diremos a tu código cómo hablar con la base de datos que acabas de crear.

1.  **Configura las Variables de Entorno (Tus Secretos):**
    *   En la raíz de tu proyecto, crea un archivo llamado `.env.local`. **Este archivo es ignorado por Git y nunca debe subirse al repositorio.**
    *   Abre el archivo JSON que descargaste en el paso anterior. Verás campos como `"project_id"`, `"client_email"` y una larga `"private_key"`.
    *   Copia estos valores en tu archivo `.env.local` de la siguiente manera:

        ```env
        # Credenciales de Firebase Admin
        FIREBASE_PROJECT_ID="el-project-id-de-tu-json"
        FIREBASE_CLIENT_EMAIL="el-client-email-de-tu-json"
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...la-clave-completa...\n-----END PRIVATE KEY-----\n"

        # Clave de API de Google Maps (si la usas)
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu-clave-de-google-maps"
        ```
    *   **MUY IMPORTANTE:** La `private_key` en el JSON contiene saltos de línea (`\n`). Debes asegurarte de que se copien correctamente dentro de las comillas.

2.  **Inicializador de Firebase:**
    *   Ya he añadido la dependencia `firebase-admin` a tu `package.json` y he creado el archivo `src/lib/firebase-admin.ts`.
    *   Este archivo lee automáticamente las variables de entorno que acabas de configurar y establece la conexión segura con Firebase. No necesitas modificarlo.

3.  **Actualiza las Rutas de la API (El Gran Cambio):**
    *   Este es el paso más importante. Debes ir a cada archivo dentro de `/src/app/api/...` y cambiar la lógica para que use Firestore en lugar de la base de datos de prueba (`db`).
    *   **Ejemplo con `src/app/api/projects/route.ts`:**

        ```typescript
        // ANTES (usando la base de datos de prueba)
        import { NextResponse } from 'next/server';
        import { db } from '@/lib/db';
        import type { Project } from '@/lib/api';
        import { v4 as uuidv4 } from 'uuid';

        export async function GET() {
            return NextResponse.json(db.projects);
        }

        export async function POST(request: Request) {
            const projectData: Omit<Project, 'id'> = await request.json();
            const newProject: Project = { ...projectData, id: uuidv4() };
            db.projects.push(newProject);
            return NextResponse.json(newProject, { status: 201 });
        }
        ```

        ```typescript
        // DESPUÉS (usando Firestore)
        import { NextResponse } from 'next/server';
        import { firestore } from '@/lib/firebase-admin'; // Importa tu cliente de Firestore
        import type { Project } from '@/lib/api';

        export async function GET() {
            // Conecta a tu base de datos real y obtiene los proyectos
            const projectsSnapshot = await firestore.collection('projects').get();
            const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
            return NextResponse.json(projects);
        }

        export async function POST(request: Request) {
            const projectData: Omit<Project, 'id'> = await request.json();
            // Añade un nuevo documento a la colección 'projects'
            const docRef = await firestore.collection('projects').add(projectData);
            return NextResponse.json({ id: docRef.id, ...projectData }, { status: 201 });
        }
        ```
    *   **Acción Requerida:** Debes aplicar este mismo patrón (reemplazar `db` con `firestore` y sus métodos `get()`, `add()`, `update()`, `delete()`) a **TODAS las rutas de la API** en la carpeta `/src/app/api`.

---

### **Paso 3 (Detallado): Configurar la Autenticación**

Para que los empleados inicien sesión de forma segura.

1.  **Activa Firebase Authentication:**
    *   En la consola de Firebase, ve a `Construir > Authentication` y haz clic en "Comenzar".
    *   En la pestaña "Sign-in method", elige un proveedor. El más común es **"Correo electrónico/Contraseña"**. Habilítalo.
2.  **Implementa el Flujo de Inicio de Sesión:**
    *   Esto es una tarea de desarrollo. Necesitarás usar el [SDK de cliente de Firebase](https://firebase.google.com/docs/auth/web/start) en tu aplicación de Next.js.
    *   Crea páginas o componentes para el registro de nuevos usuarios, el inicio de sesión y la recuperación de contraseña.
    *   Utiliza un React Context o un gestor de estado para mantener la información del usuario logueado (su ID, email, etc.) disponible en toda la aplicación.
3.  **Reemplaza los Datos de Prueba:**
    *   En los archivos donde veas comentarios como `// TODO: Get current user from auth context`, deberás obtener el ID y los datos del usuario desde tu contexto de autenticación en lugar de usar los datos de prueba.

---

### **Paso 4 (Detallado): Desplegar la Aplicación en Vercel**

Vercel es el servicio de hosting ideal para Next.js, creado por los mismos desarrolladores.

1.  **Regístrate en Vercel:** Ve a [Vercel](https://vercel.com/) y crea una cuenta. Es recomendable registrarse usando tu cuenta de GitHub, GitLab o Bitbucket.
2.  **Conecta tu Repositorio de Git:** Una vez dentro de tu panel de Vercel, haz clic en "Add New... > Project".
3.  **Importa tu Proyecto:** Vercel te mostrará una lista de tus repositorios de Git. Selecciona el repositorio de tu aplicación WorkFlow Central y haz clic en "Import".
4.  **Configura el Proyecto:** Vercel detectará que es un proyecto Next.js y pre-configurará todo por ti. No necesitas cambiar nada en la configuración de build.
5.  **Añade las Variables de Entorno (VITAL):**
    *   Antes de desplegar, ve a la pestaña "Settings" > "Environment Variables".
    *   Aquí, debes añadir **las mismas claves** que pusiste en tu archivo `.env.local` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
    *   Esto es crucial porque Vercel no tiene acceso a tu archivo local `.env.local`. Le estás dando de forma segura las credenciales para que tu aplicación desplegada pueda conectarse a la base de datos.
6.  **Despliega:** Haz clic en el botón "Deploy". Vercel instalará las dependencias, construirá tu aplicación y la desplegará en su red global.

---

### **Paso 5: ¡A Probar!**

Una vez finalizado el despliegue (tarda unos minutos), Vercel te dará una URL pública (ej. `https://workflow-central.vercel.app`).

*   **¡Esa es la URL que debes compartir con tus empleados para que empiecen a usar la aplicación!**
*   Cada vez que hagas un `git push` a la rama principal de tu repositorio, Vercel detectará los cambios y redesplegará automáticamente la última versión. ¡Así de fácil!
