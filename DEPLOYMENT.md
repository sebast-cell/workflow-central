# Guía de Despliegue a Producción Detallada (con Firebase)

¡Felicidades por llegar a esta etapa! Esta guía te ayudará a llevar tu aplicación WorkFlow Central de un entorno con datos de prueba a un entorno de producción real, utilizando **Firebase** como nuestro backend (base de datos, autenticación, etc.) y **Firebase App Hosting** para el despliegue.

## 1. ¿Por qué el Ecosistema de Firebase?

Firebase es una plataforma de desarrollo de aplicaciones de Google que nos proporciona una base de datos (Firestore), un sistema de autenticación, y hosting. Usar Firebase App Hosting nos permite mantener toda nuestra infraestructura en un solo lugar, simplificando la gestión y asegurando una integración perfecta.

## 2. Los 3 Pilares del Despliegue

Para que la aplicación sea funcional en producción, necesitas tres componentes clave en la nube:

1.  **Una Base de Datos:** Para almacenar y persistir los datos de forma segura (empleados, proyectos, etc.). Usaremos **Firestore**.
2.  **Un Sistema de Autenticación:** Para que los usuarios puedan iniciar sesión de forma segura. Usaremos **Firebase Authentication**.
3.  **Un Servicio de Hosting:** Para alojar tu aplicación y hacerla accesible en internet. Usaremos **Firebase App Hosting**.

---

### **Paso 1 (Detallado): Configurar el Backend con Firebase**

1.  **Crea un Proyecto en Firebase:**
    *   Ve a la [Consola de Google Cloud](https://console.cloud.google.com/) para crear un nuevo proyecto y asociarlo a tu cuenta de facturación **Blaze**. Esto es crucial para evitar el límite de proyectos del plan gratuito.
    *   Una vez creado, el proyecto aparecerá en tu [Consola de Firebase](https://console.firebase.google.com/). Selecciónalo.

2.  **Activa Firestore Database:**
    *   En el panel de tu proyecto de Firebase, ve a `Construir > Firestore Database`.
    *   Haz clic en "Crear base de datos".
    *   **Importante:** Selecciona iniciar en **modo de producción**. Esto asegura que tus datos estén protegidos por defecto.
    *   Elige una ubicación para tus servidores de Firestore (ej. `eur3` en Europa).

3.  **Crea las Colecciones Iniciales:**
    *   Firestore organiza los datos en "colecciones". Ve a la pestaña de "Datos" de Firestore y crea las siguientes colecciones principales. Puedes dejarlas vacías por ahora; tu aplicación las llenará.
    *   **ACCIÓN REQUERIDA:** Crea las siguientes colecciones: `employees`, `projects`, `objectives`, `tasks`, `incentives`, `settings`.

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
    *   En la raíz de tu proyecto, crea un archivo llamado `.env.local` (si no existe ya).
    *   **ACCIÓN REQUERIDA:** Abre este archivo y el archivo `.json` que descargaste. Copia los valores correspondientes.

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

3.  **Actualiza las Rutas de la API (Completado):**
    *   Este paso ya ha sido completado por el asistente. Todos los archivos en `/src/app/api/...` han sido actualizados para usar Firestore en lugar de la base de datos de prueba.

---

### **Paso 3 (Detallado): Desplegar la Aplicación con Firebase App Hosting**

1.  **Ve a la sección de App Hosting:**
    *   En la [Consola de Firebase](https://console.firebase.google.com/), selecciona tu proyecto.
    *   En el menú de la izquierda, ve a `Construir > App Hosting`.

2.  **Crea un Backend de App Hosting:**
    *   Haz clic en "Empezar".
    *   App Hosting te pedirá conectar tu cuenta de GitHub y seleccionar el repositorio donde está tu aplicación.
    *   Sigue los pasos. Firebase detectará tu framework (Next.js) y la configuración en `apphosting.yaml` automáticamente.

3.  **Añade las Variables de Entorno como Secretos (VITAL):**
    *   Una vez que el backend esté creado, ve a la configuración del backend de App Hosting.
    *   Busca una opción para gestionar "Secretos" o "Variables de Entorno".
    *   **ACCIÓN REQUERIDA:** Añade las **mismas claves** que pusiste en tu archivo `.env.local` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`) como secretos. Esto es crucial para que el servidor en producción pueda conectar con tu base de datos.

4.  **Revisa el Despliegue:**
    *   Una vez configurado, Firebase App Hosting intentará hacer el primer despliegue. Puedes ver el progreso en la consola.
    *   Si todo va bien, te proporcionará una URL pública para tu aplicación (ej. `https://<tu-app>.web.app`).

---

### **Paso 4: ¡A Probar!**

*   **¡Esa es la URL que debes compartir con tus empleados!**
*   Cada vez que hagas un `git push` a la rama principal de tu repositorio, App Hosting detectará los cambios y redesplegará automáticamente la última versión. ¡Así de fácil!
*   No olvides implementar también la **Autenticación de Firebase** para que tus empleados puedan iniciar sesión.
