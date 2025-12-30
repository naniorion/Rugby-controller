# Rugby OBS Controller

Controlador profesional para transmisiones de Rugby en OBS, desarrollado con Electron, React y TypeScript.

## Características Principales

*   **Marcador en tiempo real**: Gestión de puntos (Ensayo, Transformación, Golpe, Drop) con cálculo automático.
*   **Cronómetro**: Control de tiempo con soporte para 1ª y 2ª parte, parada y ajuste manual.
*   **Gestión de Equipos**: Nombres, iniciales, colores y logos personalizables.
*   **Alineaciones**: Editor de alineaciones y gestión de sustituciones en tiempo real.
*   **Tarjetas**: Control de tarjetas amarillas (con temporizador de 10 min) y rojas.
*   **Overlay Dinámico**:
    *   Diseño moderno y limpio.
    *   Animaciones de entrada/salida.
    *   Resumen del partido (Log de acciones).
    *   Muestra de alineaciones y estadísticas.
    *   Textos en Español.
*   **Conexión OBS**: Integración vía Browser Source (Fuente de Navegador).

## Instrucciones de Instalación

### Opción A: Usar el Ejecutable (Portable)
Si ya tienes la carpeta `dist/win-unpacked` o el archivo `.exe` generado:
1.  No requiere instalación.
2.  Copia la carpeta entera donde quieras.
3.  Ejecuta `rugby-obs-controller.exe`.

### Opción B: Desarrollo (Código Fuente)
Si quieres modificar el código:
1.  Asegúrate de tener **Node.js** instalado.
2.  Clona este repositorio o descomprime el código.
3.  Abre una terminal en la carpeta del proyecto.
4.  Instala las dependencias:
    ```bash
    npm install
    ```
5.  Inicia en modo desarrollo:
    ```bash
    npm run dev
    ```

## Instrucciones de Uso

1.  **Abrir la Aplicación**: Ejecuta el programa. Se abrirá el **Panel de Control**.
2.  **Configurar OBS**:
    *   En el Panel de Control, busca el recuadro verde que dice **Overlay URL** (ej. `http://localhost:3000/#/overlay`).
    *   En OBS Studio, añade una **Fuente de Navegador (Browser Source)**.
    *   Pega la URL en el campo correspondiente.
    *   Establece el tamaño en **1920x1080**.
3.  **Gestionar el Partido**:
    *   Usa las pestañas para cambiar entre Puntuación, Sustituciones, Alineaciones, etc.
    *   Los cambios se reflejan inmediatamente en OBS.

## Cómo subir a GitHub

Para subir este proyecto a tu repositorio de GitHub:

1.  Crea un **nuevo repositorio** vacío en GitHub.
2.  Abre la terminal en la carpeta de este proyecto.
3.  Inicializa git (si no lo has hecho):
    ```bash
    git init
    ```
4.  Asegúrate de tener un archivo `.gitignore` (ver abajo).
5.  Añade los archivos:
    ```bash
    git add .
    ```
6.  Haz el primer commit:
    ```bash
    git commit -m "Versión inicial 1.0.0"
    ```
7.  Conecta con tu repositorio (cambia la URL por la tuya):
    ```bash
    git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    ```
8.  Sube los cambios:
    ```bash
    git push -u origin master
    ```

## Estructura del Proyecto

*   `src/`: Código fuente de la interfaz (React).
    *   `pages/Dashboard.tsx`: Panel de control principal.
    *   `pages/Overlay.tsx`: Diseño gráfico que sale en OBS.
    *   `context/MatchContext.tsx`: "Cerebro" de la app, gestiona toda la lógica.
*   `electron/`: Código del proceso principal de escritorio.
    *   `main.ts`: Configuración de ventanas y servidor.

---
*Creado por naniorion*
