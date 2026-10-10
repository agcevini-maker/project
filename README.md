# Sin Miedo — prototipo

> "El miedo no se va leyendo. Se va practicando, con amigos y para algo que te importa."

**Novedades de esta versión** (ver también "Sobre el proyecto" dentro de la app):
- **Mi meta**: el viaje de egresados, unas zapatillas, un recital. Muestra en cuántos meses llegás guardando en el cajón contra invirtiendo, con el precio de la meta subiendo por la inflación.
- **¿Y si…?**: con lo que te regalaron, qué podrías comprar hoy si lo hubieras invertido hace 6, 12 o 24 meses.
- **Liga del curso**: todos con el mismo mercado (los precios usan una semilla fija) y $100.000 de mentira. El puntaje premia ganarle a la inflación, diversificar y no vender en pánico; resta las caídas fuertes. En la versión publicada con link la liga es compartida (solo se guarda un apodo y el puntaje); en el archivo local muestra una liga de ejemplo.
- **Preguntá sin vergüenza**: asistente para preguntas básicas. En la versión publicada responde Claude; en el archivo local usa respuestas guardadas y el diccionario.
- **Salto con un adulto**: si sos menor, la app arma un mensaje para invitar a tu mamá, papá o tutor a habilitar la cuenta (pendiente confirmar con LBO cómo funciona).

**Supuestos de ejemplo**: los valores de inflación y rendimientos de "Mi meta" y "¿Y si…?" están en el objeto `SUPUESTOS` de `index.html`. No son datos reales: hay que reemplazarlos por la inflación del INDEC y rendimientos históricos reales antes de mostrarlos como tales.

Prototipo de app para animarse a invertir: **aprender** con lecciones de 1 minuto, **entender** las palabras raras tocándolas, **practicar** con plata de mentira y **animarse** a dar el primer paso real.

Abrí `index.html` en el navegador (no necesita instalar nada). En la compu se ve como la plataforma web de un broker (barra superior, cinta de cotizaciones, tabla de mercado con panel de operación al costado); en el celular pasa a una columna con barra inferior.

## Flujo

1. **Bienvenida**: 3 preguntas (experiencia, qué te frena, cuánto podrías poner). Adaptan el camino:
   - si ya invertís seguido, el nivel 1 queda opcional;
   - lo que te frena define el consejo que aparece arriba del camino;
   - el monto define el primer paso sugerido al final.
2. **El camino**: 5 niveles, cada uno con una lección corta y una pregunta de práctica.
3. **Palabras raras**: los términos subrayados abren una explicación de una línea con un ejemplo cotidiano.
4. **Simulador de broker**: se desbloquea al terminar el nivel 3 (o con "Abrirlo igual (modo presentación)"). Cuenta con $100.000 de mentira y las pantallas de un broker real:
   - **Mercado**: FCI, bonos, CEDEARs y acciones, con buscador, filtros, cotización y variación del día que se mueven en vivo.
   - **Ficha del activo**: gráfico (1S / 1M / 3M), tu tenencia, explicación en palabras simples y nivel de riesgo.
   - **Órdenes**: comprar/vender (suscribir/rescatar en fondos), a mercado o límite, plazo CI o 24hs, comisión, paso de revisión y comprobante.
   - **Cartera**: valor total, ganancia/pérdida, gráfico, distribución por tipo, tenencias y "Avanzar el tiempo" (1 día / 1 semana / 1 mes).
   - **Movimientos**: historial de órdenes con estado; las órdenes límite pendientes se pueden cancelar.
   - Las palabras técnicas del broker (CI, 24hs, orden límite, cuotaparte, comisión…) también se pueden tocar para ver qué significan.
5. **El salto**: al terminar el camino, propone un monto chico para hacer lo mismo con plata real en LBO.

También incluye:
- **Perfil de inversor** según las 3 preguntas; si comprás algo con más riesgo que tu perfil, la boleta pide confirmar que entendés el riesgo.
- **Diccionario** con todas las palabras raras y buscador.
- **Línea de inflación** en el gráfico de la cartera (inflación simulada ~2,3% por mes).
- **Avisos** cuando se ejecuta una orden límite.
- **Resumen de la práctica** en "El salto" (días, operaciones, peor caída vivida, resultado).
- **"Cargar ejemplo para presentar"** (abajo de todo): deja la app lista con una cartera de dos meses.

El progreso se guarda en el navegador (localStorage). "Reiniciar todo" lo borra.

Para presentar, ver [PRESENTACION.md](PRESENTACION.md).

## Pendientes antes de mostrarlo

- **El simulador usa activos de ejemplo** (fondos genéricos y algunos bonos, CEDEARs y acciones conocidos). Ajustar la lista a los productos reales de LBO después de la reunión con Lautaro.
- **Los precios, la comisión (0,6%), la inflación y los movimientos son inventados** y aleatorios; no son cotizaciones reales.
- El botón "Hacerlo en LBO" no lleva a ningún lado todavía.
- El contenido de las lecciones es un borrador: conviene que alguien de LBO lo revise antes de usarlo.

## App de escritorio (Windows)

La carpeta `desktop/` convierte el prototipo en una app de escritorio con [Electron](https://www.electronjs.org/). Usa el mismo `index.html`.

- Para armarla (en Linux o Mac, con `curl`, `unzip` y `zip`): `./desktop/build-windows.sh`. Deja `desktop/dist/Sin-Miedo-Windows.zip`.
- En Windows: descomprimir el .zip y abrir `Sin Miedo.exe`. F11 pone pantalla completa.
- Como no está firmada, Windows puede mostrar "Windows protegió su PC": "Más información" → "Ejecutar de todas formas".
- Para probarla con Node instalado: `cd desktop && npm install && npm start` (copiar antes `index.html` dentro de `desktop/`).

---

## Traste (carpeta `traste/`)

App aparte para aprender guitarra desde cero (Vite + JavaScript, instalable como PWA). Ver [traste/README.md](traste/README.md):

```bash
cd traste
npm install
npm run dev
```
