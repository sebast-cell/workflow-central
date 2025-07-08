# Guía Definitiva: Desplegar desde Cero (¡Ahora sí!)

Hola, lamento enormemente todos los problemas. Olvidemos todo lo anterior. Este es un plan nuevo y limpio, diseñado para funcionar sí o sí.

---
### **Paso 1: Crea el Repositorio en GitHub.com (El Paso Clave)**

1.  Ve a **[https://github.com/new](https://github.com/new)**.
2.  En "Repository name", escribe **exactamente**: `workflow-central`
3.  Selecciona **"Public"**.
4.  **MUY IMPORTANTE:** NO marques ninguna casilla. Ni "Add a README file", ni ".gitignore", ni "choose a license". Déjalo todo vacío.
5.  Haz clic en el botón verde **"Create repository"**.

Ahora tienes un repositorio nuevo y vacío en la dirección correcta.

---
### **Paso 2: Conecta este Proyecto al Nuevo Repositorio (EN LA TERMINAL DE AQUÍ)**

Ahora, vuelve aquí, al editor. Abre la **Terminal** de abajo y pega estos comandos, uno por uno.

1.  **Borra la conexión antigua (para empezar de limpio):**
    ```bash
    git remote rm origin
    ```
    (Es normal si este comando da un error diciendo `No such remote 'origin'`. Simplemente ignóralo y continúa).

2.  **Añade la conexión nueva y correcta:**
    ```bash
    git remote add origin https://github.com/sebast-cell/workflow-central.git
    ```

---
### **Paso 3: Sube el Código (El Empujón Final)**

Ahora que todo está conectado correctamente, sube tu código:

```bash
git push -u origin main
```

Te pedirá autorización. Puedes usar el pop-up de "Allow" o introducir tu usuario y token en la terminal como hemos practicado.

---
### **🚨 SOLUCIÓN DE PROBLEMAS: Error "Backend Not Found"**

Si después de desplegar ves una página con el error "Backend Not Found", significa que la aplicación se está "cayendo" al arrancar. La causa más común es que **la base de datos Firestore no está activada**.

**Cómo solucionarlo:**
1. Ve a tu **Consola de Firebase**.
2. En el menú, ve a **Build > Firestore Database**.
3. Si ves un botón grande que dice **"Crear base de datos"**, haz clic en él.
4. Sigue los pasos para crearla (elige el modo **Producción**).
5. Una vez creada, vuelve a la terminal y sube cualquier cambio pequeño (o haz un "commit vacío") para forzar un nuevo despliegue.
   ```bash
   git commit --allow-empty -m "Trigger new deployment"
   git push origin main
   ```
Dale unos minutos y tu app debería funcionar.

---
### **¡Victoria!**

Esta vez, como el repositorio existe y la conexión es nueva, funcionará. El despliegue en Firebase comenzará automáticamente. ¡Mucho ánimo y gracias por tu paciencia!
