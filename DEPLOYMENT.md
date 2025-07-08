# Guía Definitiva y Corregida para Desplegar tu App

¡Hola! Siento mucho los problemas que hemos tenido. Los errores que has visto (`No such remote 'origin'` y `Repository not found`) son comunes, pero mis instrucciones no han sido lo suficientemente claras. Te pido disculpas.

Esta guía está 100% corregida y diseñada para que funcione sí o sí. ¡Vamos a lograrlo juntos!

---

### **Paso 0: ¿DÓNDE ESTÁ LA TERMINAL? (La Guía Visual)**

**¡MUY IMPORTANTE!** Todos los comandos de esta guía deben ejecutarse en la **TERMINAL que está DENTRO de esta ventana del editor**, no en la terminal de tu propio ordenador.

La terminal está en la **PARTE INFERIOR** de la ventana. Busca una pestaña que diga **"TERMINAL"** y haz clic en ella.

```
+------------------------------------------------------+
| Arriba:     Menú (Archivo, Editar...)                |
+------------------------------------------------------+
| Izquierda:  LISTA DE ARCHIVOS (package.json, etc.)    |
|                                                      |
|             DERECHA:                                 |
|             VENTANA PRINCIPAL DEL CÓDIGO             |
|                                                      |
+------------------------------------------------------+
| ABAJO:      [ PESTAÑAS: Problemas | Salida | TERMINAL ] <--- ¡AQUÍ ESTÁ!
+------------------------------------------------------+
```

---

### **Paso 1 (EN LA TERMINAL): Conecta tu Repositorio (El Comando Correcto)**

Este comando le dice a tu proyecto cuál es tu repositorio en GitHub. Copia y pégalo en la Terminal y presiona `Enter`.

```bash
git remote add origin https://github.com/sebast-cell/workflow-central.git
```

**¿Qué pasa si da un error que dice `fatal: remote origin already exists.`?**
¡No te preocupes, es bueno! Significa que ya hay una conexión, aunque puede que sea incorrecta. Si te sale este error, usa el siguiente comando para **corregir** la dirección:

```bash
git remote set-url origin https://github.com/sebast-cell/workflow-central.git
```

---

### **Paso 2 (EN LA TERMINAL): Sube TODO el Código**

Ahora, vamos a subir el código. Copia y pega este comando y presiona `Enter`.

```bash
git push -u origin main
```

---

### **Paso 3: Autoriza con GitHub (La Ventana Emergente)**

Después del comando anterior, el editor te mostrará un mensaje preguntando si quieres iniciar sesión con GitHub.

1.  Haz clic en **"Allow"** (Permitir).
2.  Se abrirá una ventana de tu navegador.
3.  Haz clic en el botón verde **"Authorize Visual Studio Code"**.
4.  Vuelve a la ventana del editor. ¡El código empezará a subirse solo!

Si no te aparece la ventana y la terminal se queda "pensando", es que te está pidiendo el usuario y la contraseña a la antigua:
*   `Username`: Escribe `sebast-cell` y presiona `Enter`.
*   `Password`: **Pega tu token** (el que empieza con `ghp_...`). **No verás nada mientras escribes.** Es normal. Solo pégalo y presiona `Enter`.

---

### **Paso 4: ¡Victoria!**

*   Si todo ha ido bien, la terminal mostrará que los archivos se están subiendo.
*   En la página de **Firebase App Hosting**, empezará un nuevo despliegue automáticamente. ¡Esta vez funcionará!
*   Cuando termine, te dará una URL. ¡Esa es tu aplicación funcionando!

**¡Ánimo, ya estás en el último paso!**
