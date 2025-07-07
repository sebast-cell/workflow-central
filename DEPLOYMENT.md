# Guía Visual Definitiva para Desplegar tu App

¡Hola! Sé que los pasos anteriores han sido confusos. Te pido disculpas. Esta guía está diseñada para que sea imposible perderse. ¡Vamos a lograrlo!

---

### **Paso 0: ¿DÓNDE ESTÁ LA TERMINAL? (La Guía Visual)**

La terminal está en la **PARTE INFERIOR** de toda la ventana del editor.

**Imagina que la pantalla es así:**

```
+------------------------------------------------------+
| Arriba:     Menú (Archivo, Editar...)                |
+------------------------------------------------------+
| Izquierda:  LISTA DE ARCHIVOS (package.json, src...)  |
|                                                      |
|             DERECHA:                                 |
|             VENTANA PRINCIPAL DEL CÓDIGO             |
|             (Aquí es donde ves los archivos)         |
|                                                      |
|                                                      |
|                                                      |
+------------------------------------------------------+
| ABAJO:      [ PESTAÑAS: Problemas | Salida | TERMINAL ] <--- ¡AQUÍ ESTÁ!
+------------------------------------------------------+
```

1.  **Mueve tus ojos hacia la parte más BAJA de la ventana.**
2.  Busca una fila de pestañas. Una de ellas dice **TERMINAL**.
3.  **Haz clic en esa palabra: "TERMINAL"**. Se abrirá un recuadro negro. ¡Esa es la terminal!

---

### **Paso 1 (EN LA TERMINAL): Prepara tu Repositorio**

Ahora que has encontrado la **TERMINAL**, copia y pega los siguientes 3 comandos, uno por uno. Presiona `Enter` después de cada uno.

1.  Conecta tu repositorio de GitHub:
    ```bash
    git remote set-url origin https://github.com/sebast-cell/workflow-central.git
    ```

2.  Nombra la rama principal como `main`:
    ```bash
    git branch -M main
    ```

3.  **Sube TODO el código a GitHub (el comando final):**
    ```bash
    git push -u origin main
    ```

---

### **Paso 2 (EN LA TERMINAL): Tu Usuario y Contraseña Especial**

Después del último comando, la terminal te pedirá dos cosas:

*   `Username`: Escribe tu nombre de usuario de GitHub y presiona `Enter`.
*   `Password`: **¡MUY IMPORTANTE!** Pega aquí tu **Token de Acceso Personal** (la contraseña que empieza por `ghp_...`). **No verás nada mientras escribes o pegas.** Es normal. Solo pégalo y presiona `Enter`.

---

### **Paso 3: ¡Victoria!**

*   Si todo ha ido bien, la terminal mostrará que los archivos se están subiendo.
*   En la página de **Firebase App Hosting**, empezará un nuevo despliegue automáticamente. ¡Esta vez funcionará!
*   Cuando termine, te dará una URL. ¡Esa es tu aplicación funcionando!

**¡Ánimo, ya estás en el último paso!**
