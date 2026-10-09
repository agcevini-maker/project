# Traste

App para aprender guitarra desde cero: ruta de 20 lecciones, diccionario de acordes, teoría interactiva, entrenamiento de oído, punteo de rock melódico con zapada y herramientas de práctica. Todo el sonido se genera en el navegador con Web Audio, sin archivos de audio.

## Requisitos

- [Node.js](https://nodejs.org) 18 o superior
- Un editor: VS Code, o Claude Code en la terminal

## Correrla en tu computadora

```bash
npm install
npm run dev
```

Abrí la dirección que aparece (por ejemplo `http://localhost:5173`). Como se inicia con `--host`, también podés abrirla desde el celular si está en la misma red Wi-Fi, con la IP que muestra la terminal.

## Generar la versión final

```bash
npm run build      # crea la carpeta dist/
npm run preview    # la sirve para probarla
```

La carpeta `dist/` se puede subir tal cual a cualquier hosting estático (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

## Instalarla en el celular (PWA)

Una vez publicada en una dirección con `https`:

- **Android (Chrome):** menú ⋮ y "Instalar app" o "Agregar a la pantalla principal".
- **iPhone (Safari):** botón Compartir y "Agregar a inicio".

Queda con su ícono, se abre a pantalla completa y funciona sin conexión después de la primera visita.

## Programa para Windows

La app se puede instalar en la computadora como un programa común (con Electron): se abre desde el menú Inicio o el escritorio, sin navegador y sin internet.

En pantallas anchas (computadora) la app muestra una barra lateral con las secciones, el progreso y el selector de tema claro/oscuro. Atajos de teclado: `1` a `6` cambian de sección y `Esc` detiene todo lo que esté sonando.

```bash
npm run app        # la abre en una ventana, para probarla
npm run dist:win   # crea release/Traste-Setup-1.0.0.exe
```

- `dist:win` funciona directo en Windows. En Linux o Mac necesita [Wine](https://www.winehq.org) instalado.
- También se puede generar desde GitHub, sin instalar nada: pestaña **Actions** → **Traste para Windows** → **Run workflow**. El `.exe` queda en "Artifacts" al terminar.
- El instalador no está firmado digitalmente, así que Windows puede mostrar el aviso "Windows protegió tu PC". Se sigue con **Más información** → **Ejecutar de todas formas**. Para que no aparezca hace falta un certificado de firma de código.

## Convertirla en app nativa para celular (opcional)

Para publicarla en Google Play o App Store podés envolverla con Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init Traste ar.traste.app --web-dir dist
npm run build
npx cap add android      # requiere Android Studio
npx cap add ios          # requiere una Mac con Xcode
npx cap sync
npx cap open android
```

## Estructura

```
index.html                 Estructura de las seis pestañas
src/main.js                Lógica: datos, audio, diagramas, ejercicios
src/styles.css             Estilos con tema claro y oscuro
public/manifest.webmanifest  Datos para instalarla como app
public/sw.js               Caché para usarla sin conexión
public/icons/              Íconos
electron/main.cjs          Ventana del programa de escritorio
```

## Seguir desarrollándola con Claude Code

Desde la carpeta del proyecto ejecutá `claude` y pedile cambios en lenguaje natural. El archivo `CLAUDE.md` le explica cómo está organizado el código. Ideas para empezar:

- "Separá main.js en módulos: audio, datos de acordes, lecciones, oído y punteo"
- "Agregá un afinador que use el micrófono"
- "Sumá un modo de ejercicios de lectura de tablatura"
