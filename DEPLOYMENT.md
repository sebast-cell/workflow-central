# Guía de Despliegue a Producción Detallada (con Firebase)

¡Felicidades por llegar a esta etapa! Esta guía te ayudará a llevar tu aplicación WorkFlow Central de un entorno con datos de prueba a un entorno de producción real, utilizando **Firebase** como nuestro backend (base de datos, autenticación, etc.).

## 1. ¿Por qué Firebase?

Firebase es una plataforma de desarrollo de aplicaciones de Google que nos proporciona una base de datos (Firestore), un sistema de autenticación, hosting y mucho más. Es una solución robusta y muy bien integrada con el ecosistema de Google.

## 2. Los 3 Pilares del Despliegue

Para que la aplicación sea funcional en producción, necesitas tres componentes clave en la nube:

1.  **Una Base de Datos:** Para almacenar y persistir los datos de forma segura (empleados, proyectos, etc.). Usaremos **Firestore**.
2.  **Un Sistema de Autenticación:** Para que los usuarios puedan iniciar sesión de forma segura. Usaremos **Firebase Authentication**.
3.  **Un Servicio de Hosting:** Para alojar tu aplicación y hacerla accesible en internet. Usaremos **Vercel** o **Firebase App Hosting**.

---

### **Paso 1 (Detallado): Configurar el Backend con Firebase**

1.  **Crea un Proyecto en Firebase:**
    *   Ve a la [Consola de Firebase](https://console.firebase.google.com/) y haz clic en "Crear un proyecto".
    *   Dale un nombre (ej. "WorkFlow Central") y sigue los pasos. Si te lo pide, puedes deshabilitar Google Analytics para este proyecto si no lo necesitas.

2.  **Activa Firestore Database:**
    *   Una vez en el panel de tu proyecto, en el menú de la izquierda, ve a `Construir > Firestore Database`.
    *   Haz clic en "Crear base de datos".
    *   **Importante:** Selecciona iniciar en **modo de producción**. Esto asegura que tus datos estén protegidos por defecto.
    *   Elige una ubicación para tus servidores de Firestore (ej. `eur3` en Europa).

3.  **Crea las Colecciones Iniciales:**
    *   Firestore organiza los datos en "colecciones". Ve a la pestaña de "Datos" de Firestore y crea las siguientes colecciones principales. Puedes dejarlas vacías por ahora; tu aplicación las llenará.
    *   Colecciones a crear: `employees`, `projects`, `objectives`, `tasks`, `incentives`, `settings`.

4.  **Genera las Credenciales de Servidor (La Llave Secreta):**
    *   Tu backend de Next.js necesita una forma segura de comunicarse con Firebase. Para esto, generaremos una "cuenta de servicio".
    *   En la consola de Firebase, haz clic en el engranaje de `Configuración del proyecto` (arriba a la izquierda).
    *   Ve a la pestaña `Cuentas de servicio`.
    *   Selecciona "Node.js" y haz clic en el botón **"Generar nueva clave privada"**.
    *   Se descargará un archivo `.json`. **¡Guárdalo bien y no lo compartas públicamente!** Contiene las claves de administrador de tu proyecto.

---

### **Paso 2 (Detallado): Conectar la Aplicación a Firebase**

Ahora le diremos a tu código cómo hablar con la base de datos que acabas de crear.

1.  **Configura las Variables de Entorno (Tus Secretos):**
    *   En la raíz de tu proyecto, crea un archivo llamado `.env.local`.
    *   Abre este archivo y el archivo `.json` que descargaste. Copia los valores correspondientes.

        ```env
        # Claves de Firebase para el servidor
        FIREBASE_PROJECT_ID="el-project-id-de-tu-archivo-json"
        FIREBASE_CLIENT_EMAIL="el-client-email-de-tu-archivo-json"
        FIREBASE_PRIVATE_KEY="la-private-key-completa-de-tu-archivo-json"
        ```
    *   **Muy importante:** La `private_key` en el JSON puede contener caracteres de salto de línea (`\n`). Asegúrate de copiarla y pegarla exactamente como está, entre comillas.

2.  **Inicializador de Firebase:**
    *   He añadido la dependencia `firebase-admin` a tu `package.json` y he creado el archivo `src/lib/firebase-admin.ts`.
    *   Este archivo lee automáticamente las variables de entorno y crea un cliente para interactuar con Firebase desde el servidor. No necesitas modificarlo.

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
            try {
                const projectsSnapshot = await firestore.collection('projects').get();
                const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return NextResponse.json(projects);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return NextResponse.json({ error: errorMessage }, { status: 500 });
            }
        }

        export async function POST(request: Request) {
            try {
                const projectData: Omit<Project, 'id'> = await request.json();
                const docRef = await firestore.collection('projects').add(projectData);
                const newProject = { id: docRef.id, ...projectData };
                return NextResponse.json(newProject, { status: 201 });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return NextResponse.json({ error: errorMessage }, { status: 500 });
            }
        }
        ```
    *   **Acción Requerida:** Debes aplicar este mismo patrón (reemplazar `db` con `firestore` y sus métodos `.collection()`, `.get()`, `.add()`, etc.) a **TODAS las rutas de la API** en la carpeta `/src/app/api`. La [documentación de Firebase](https://firebase.google.com/docs/firestore/quickstart) es excelente para esto.

---

### **Paso 3 (Detallado): Configurar la Autenticación**

Firebase Authentication es muy fácil de usar.

1.  **Activa Firebase Authentication:**
    *   En la consola de Firebase, ve a `Construir > Authentication`.
    *   Haz clic en "Empezar" y en la pestaña "Métodos de inicio de sesión", habilita el proveedor "Correo electrónico/Contraseña".
2.  **Implementa el Flujo de Inicio de Sesión:**
    *   Usa el SDK de cliente de Firebase en tu aplicación de Next.js (este es diferente a `firebase-admin`).
    *   Crea las páginas para registro, inicio de sesión, etc.
    *   Una vez que un usuario inicie sesión, puedes obtener su información y usarla en toda la aplicación.

---

### **Paso 4 (Detallado): Desplegar la Aplicación en Vercel**

1.  **Regístrate en Vercel:** Ve a [Vercel](https://vercel.com/) y crea una cuenta (es mejor usar tu cuenta de GitHub, GitLab, etc.).
2.  **Importa tu Proyecto:** En Vercel, haz clic en "Add New... > Project" y selecciona el repositorio de tu aplicación.
3.  **Configura el Proyecto:** Vercel detectará que es un proyecto Next.js y lo pre-configurará.
4.  **Añade las Variables de Entorno (VITAL):**
    *   Ve a "Settings" > "Environment Variables".
    *   Añade las **mismas claves** que pusiste en tu archivo `.env.local` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`).
5.  **Despliega:** Haz clic en "Deploy".

---

### **Paso 5: ¡A Probar!**

Una vez finalizado el despliegue, Vercel te dará una URL pública (ej. `https://workflow-central.vercel.app`).

*   **¡Esa es la URL que debes compartir con tus empleados!**
*   Cada vez que hagas un `git push` a la rama principal de tu repositorio, Vercel detectará los cambios y redesplegará automáticamente la última versión. ¡Así de fácil!
