# Contexto del proyecto para Claude Code

Traste es una app web (Vite + JavaScript sin framework) para aprender guitarra. Interfaz y contenido en español rioplatense (voseo: "tocá", "elegí").

## Comandos
- `npm run dev`: servidor de desarrollo
- `npm run build`: compila en `dist/`
- `npm run app`: la abre como programa de escritorio (Electron, `electron/main.cjs` carga `dist/index.html`)
- `npm run dist:win`: instalador de Windows en `release/` (en Linux necesita Wine)

## Organización de src/main.js (en este orden)
1. Datos básicos: NOTES, LAT (nombres latinos), OPEN (MIDI de las cuerdas al aire, índice 0 = 6ª cuerda), `store` (localStorage con prefijo `traste:`)
2. CHORDS: `f` = trastes de 6ª a 1ª ("x" = no se toca), `fi` = dedos, `barre` = traste de la cejilla
3. Audio: síntesis Karplus-Strong (`stringBuf`, `playNote`, `strum`)
4. `chordSVG` (diagramas) y `boardSVG(mark)` (diapasón de 12 trastes; `mark(s,f)` devuelve `{label, kind: 'root'|'hit'|'plain'}` o null)
5. Pestañas Ruta (LEVELS), Acordes, Teoría (TYPES, campo armónico), Práctica (afinación, metrónomo, cambios)
6. Punteo: `leadBus` (distorsión + delay), `playLead` (bends, vibrato y slides con playbackRate), LICKS con eventos `E(cuerda, traste, duración en corcheas, técnica, destino, cuerda2, traste2)`; técnicas: 'b', 'bv', 'br', 'v', 'h', 'p', '/'
7. Zapada (JAMS, batería sintetizada) y Oído (MODES)
8. Pestañas (`go`), barra lateral de escritorio (`updSide`), tema (`applyTheme`) y atajos de teclado

## Reglas de diseño
- Colores solo con las variables CSS de `:root`; mantener el tema oscuro funcionando
- Respetar las zonas seguras del celular (env(safe-area-inset-*))
- Desde 1100 px de ancho el header pasa a barra lateral y algunas secciones van en columnas (`.cols`, `.ear-layout`); probar los cambios en celular y en computadora
- Las tipografías vienen de @fontsource (sin Google Fonts) para que el programa funcione sin internet
- Los licks deben ser originales: no agregar transcripciones de canciones con derechos de autor
