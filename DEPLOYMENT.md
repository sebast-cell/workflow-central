# Guía de Despliegue a Producción Detallada (con Supabase)

¡Felicidades por llegar a esta etapa! Esta guía te ayudará a llevar tu aplicación WorkFlow Central de un entorno con datos de prueba a un entorno de producción real, utilizando **Supabase** como nuestro backend (base de datos, autenticación, etc.).

## 1. ¿Por qué Supabase?

Supabase es una alternativa de código abierto a Firebase. Nos proporciona una base de datos PostgreSQL, autenticación, APIs automáticas y almacenamiento, todo en una única plataforma. Es perfecto para nuestro caso.

## 2. Los 3 Pilares del Despliegue

Para que la aplicación sea funcional, necesitas tres componentes clave en la nube:

1.  **Una Base de Datos:** Para almacenar y persistir los datos de forma segura (empleados, proyectos, etc.).
2.  **Un Sistema de Autenticación:** Para que los usuarios puedan iniciar sesión de forma segura.
3.  **Un Servicio de Hosting:** Para alojar tu aplicación y hacerla accesible en internet.

Supabase nos proporciona los dos primeros, y usaremos Vercel para el tercero.

---

### **Paso 1 (Detallado): Configurar el Backend con Supabase**

1.  **Crea una Cuenta y un Proyecto en Supabase:**
    *   Ve a [Supabase.io](https://supabase.io/) y regístrate.
    *   Crea una nueva organización y luego un nuevo proyecto. Dale un nombre (ej. "WorkFlow Central") y elige una contraseña segura para la base de datos (guárdala bien).
    *   Elige la región del servidor que esté más cerca de tus usuarios.

2.  **Obtén tus Credenciales (Las Llaves de la API):**
    *   Una vez creado el proyecto, ve al menú de la izquierda, haz clic en el engranaje de "Configuración" (`Settings`).
    *   Selecciona la pestaña "API".
    *   Aquí encontrarás dos valores muy importantes que necesitaremos:
        *   **URL del Proyecto** (`Project URL`): Es la dirección de tu backend.
        *   **Clave `anon` (pública)** (`Project API keys` > `anon` `public`): Esta clave es segura para usar en el navegador.

3.  **Crea las Tablas en la Base de Datos:**
    *   A diferencia de Firestore, en Supabase (que usa PostgreSQL) debemos definir la estructura de nuestras tablas.
    *   Ve al "Editor SQL" (`SQL Editor`) en el menú de la izquierda.
    *   Copia y pega el siguiente código SQL en una nueva consulta y haz clic en "RUN". Esto creará todas las tablas que tu aplicación necesita.

    ```sql
    -- Tabla para Empleados
    CREATE TABLE employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT,
        role TEXT,
        status TEXT DEFAULT 'Activo',
        schedule TEXT,
        avatar TEXT,
        workCenter TEXT,
        vacationManager TEXT,
        clockInManager TEXT,
        calendarId TEXT,
        vacationPolicyId TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabla para Proyectos
    CREATE TABLE projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabla para Incentivos
    CREATE TABLE incentives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        period TEXT,
        active BOOLEAN DEFAULT true,
        company_id UUID,
        condition_expression JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabla para Objetivos
    CREATE TABLE objectives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        assigned_to TEXT,
        project_id UUID REFERENCES projects(id),
        is_incentivized BOOLEAN DEFAULT false,
        incentive_id UUID REFERENCES incentives(id),
        weight NUMERIC,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabla para Tareas
    CREATE TABLE tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE,
        is_incentivized BOOLEAN DEFAULT false,
        incentive_id UUID REFERENCES incentives(id),
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabla para la Configuración (genérica, usando JSONB)
    CREATE TABLE settings (
        id TEXT PRIMARY KEY, -- 'departments', 'roles', 'centers', etc.
        value JSONB,
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Habilitar Row Level Security (Buena práctica de seguridad)
    ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    -- Repetir para el resto de tablas...
    ```

---

### **Paso 2 (Detallado): Conectar la Aplicación a Supabase**

Ahora le diremos a tu código cómo hablar con la base de datos que acabas de crear.

1.  **Configura las Variables de Entorno (Tus Secretos):**
    *   En la raíz de tu proyecto, crea un archivo llamado `.env.local`.
    *   Abre este archivo y añade las credenciales que copiaste de Supabase:

        ```env
        # Claves públicas de Supabase (seguras para el navegador)
        NEXT_PUBLIC_SUPABASE_URL="la-url-de-tu-proyecto-de-supabase"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anon-publica"

        # (Opcional por ahora) Clave de API de Google Maps
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu-clave-de-google-maps"
        ```
    *   El prefijo `NEXT_PUBLIC_` es importante, ya que le dice a Next.js que estas variables son accesibles desde el navegador.

2.  **Inicializador de Supabase:**
    *   Ya he añadido la dependencia `@supabase/supabase-js` a tu `package.json` y he creado el archivo `src/lib/supabase.ts`.
    *   Este archivo lee automáticamente las variables de entorno y crea un cliente para interactuar con Supabase. No necesitas modificarlo.

3.  **Actualiza las Rutas de la API (El Gran Cambio):**
    *   Este es el paso más importante. Debes ir a cada archivo dentro de `/src/app/api/...` y cambiar la lógica para que use Supabase en lugar de la base de datos de prueba (`db`).
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
        // DESPUÉS (usando Supabase)
        import { NextResponse } from 'next/server';
        import { supabase } from '@/lib/supabase'; // Importa tu cliente de Supabase
        import type { Project } from '@/lib/api';

        export async function GET() {
            // Conecta a tu base de datos real y obtiene los proyectos
            const { data: projects, error } = await supabase.from('projects').select('*');
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json(projects);
        }

        export async function POST(request: Request) {
            const projectData: Omit<Project, 'id'> = await request.json();
            // Inserta un nuevo registro en la tabla 'projects'
            const { data: newProject, error } = await supabase
                .from('projects')
                .insert([projectData])
                .select()
                .single(); // .single() para que devuelva el objeto creado

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json(newProject, { status: 201 });
        }
        ```
    *   **Acción Requerida:** Debes aplicar este mismo patrón (reemplazar `db` con `supabase` y sus métodos `select()`, `insert()`, `update()`, `delete()`) a **TODAS las rutas de la API** en la carpeta `/src/app/api`. La [documentación de Supabase](https://supabase.com/docs/reference/javascript/select) es excelente para esto.

---

### **Paso 3 (Detallado): Configurar la Autenticación**

Supabase incluye un sistema de autenticación muy fácil de usar.

1.  **Activa Firebase Authentication:**
    *   En la consola de Supabase, ve a `Authentication` y luego a `Providers`.
    *   Habilita el proveedor "Email" y, si quieres, otros como Google, GitHub, etc.
2.  **Implementa el Flujo de Inicio de Sesión:**
    *   Usa el [SDK de cliente de Supabase](https://supabase.com/docs/guides/auth/quickstarts/react) en tu aplicación de Next.js.
    *   Crea las páginas para registro, inicio de sesión, etc. Supabase ofrece componentes de UI pre-hechos que puedes usar para acelerar esto.

---

### **Paso 4 (Detallado): Desplegar la Aplicación en Vercel**

1.  **Regístrate en Vercel:** Ve a [Vercel](https://vercel.com/) y crea una cuenta (es mejor usar tu cuenta de GitHub, GitLab, etc.).
2.  **Importa tu Proyecto:** En Vercel, haz clic en "Add New... > Project" y selecciona el repositorio de tu aplicación.
3.  **Configura el Proyecto:** Vercel detectará que es un proyecto Next.js y lo pre-configurará.
4.  **Añade las Variables de Entorno (VITAL):**
    *   Ve a "Settings" > "Environment Variables".
    *   Añade las **mismas claves** que pusiste en tu archivo `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5.  **Despliega:** Haz clic en "Deploy".

---

### **Paso 5: ¡A Probar!**

Una vez finalizado el despliegue, Vercel te dará una URL pública (ej. `https://workflow-central.vercel.app`).

*   **¡Esa es la URL que debes compartir con tus empleados!**
*   Cada vez que hagas un `git push` a la rama principal de tu repositorio, Vercel detectará los cambios y redesplegará automáticamente la última versión. ¡Así de fácil!
