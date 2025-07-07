# Guía de Despliegue a Producción (Versión Súper Sencilla)

¡Felicidades por llegar a esta etapa! Esta guía te ayudará a llevar tu aplicación al mundo real.

**El único obstáculo que nos queda es subir el código de esta aplicación a GitHub.** Una vez hecho eso, el resto es fácil.

---

### **Paso 0 (El más importante): Subir tu Código a GitHub**

Estos pasos son **obligatorios**. Debes hacerlos desde la **Terminal que está DENTRO de esta ventana del editor**, no desde la terminal de tu ordenador personal.

1.  **Abre la Terminal aquí:**
    *   En la parte inferior de esta ventana del editor, busca una pestaña que diga **"Terminal"**. Haz clic en ella.

2.  **Copia la URL de tu repositorio:**
    *   Ve a la página de tu repositorio en GitHub. Busca un botón verde que dice **"< > Code"** y haz clic en él. Asegúrate de que está seleccionada la pestaña **HTTPS** y copia la URL que aparece. Debería ser algo como `https://github.com/TU_USUARIO/workflow-central.git`.

3.  **Conecta y Sube el Código (Copiar y Pegar):**
    *   Ahora, copia el siguiente comando, pégalo en la **Terminal de aquí abajo**, reemplaza la URL por la tuya y presiona `Enter`:
        ```bash
        git remote set-url origin https://github.com/TU_USUARIO/workflow-central.git
        ```
        *Este comando actualiza la dirección de tu "almacén" de código. No debería dar ningún error.*

    *   A continuación, copia y pega este otro comando y presiona `Enter`. Esto prepara tu código para ser subido.
        ```bash
        git branch -M main
        ```

    *   Y ahora, el comando final para **enviar todo el código de la aplicación**:
        ```bash
        git push -u origin main
        ```

4.  **Introduce tu Usuario y tu "Contraseña Especial" (Token):**
    *   La terminal te pedirá tu `Username`: escribe tu nombre de usuario de GitHub y presiona `Enter`.
    *   Luego te pedirá `Password`: **pega aquí el Token de Acceso Personal (la contraseña que empieza por `ghp_...`) que creaste antes.** No se verá nada mientras pegas, es normal. Solo pégalo y presiona `Enter`.

5.  **Verifica que ha funcionado:**
    *   ¡Listo! Ve a la página de tu repositorio en GitHub y actualízala.
    *   **¿Qué deberías ver?** Todos los archivos de tu proyecto: una carpeta `src`, un archivo `package.json`, etc.
    *   Si ves tus archivos, ¡genial! **Ya puedes volver a la página de Firebase App Hosting**, refrescar la página, y cuando te pida la "Rama activa", escribe **`main`**. El error desaparecerá.

---

### **Pasos Finales en Firebase App Hosting**

Una vez que Firebase acepte tu rama `main` y empiece a desplegar:

1.  **Añade los "Secretos" (las Claves):**
    *   En la configuración de tu backend de App Hosting, busca una opción para gestionar **"Secretos"** o "Variables de Entorno".
    *   Añade las **mismas tres claves** que tienes en tu archivo `.env.local`: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`.
    *   Este paso es vital para que la aplicación en producción pueda hablar con tu base de datos.

2.  **¡Espera y Comparte!**
    *   Firebase tardará unos minutos en construir y desplegar tu aplicación. Cuando termine, te dará una URL pública. ¡Esa es la que debes compartir!
