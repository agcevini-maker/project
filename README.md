# Sin Miedo — prototipo

> "El miedo no se va leyendo. Se va practicando, con amigos y para algo que te importa."

**Novedades de esta versión** (ver también "Sobre el proyecto" dentro de la app):
- **Mi meta**: el viaje de egresados, unas zapatillas, un recital. Muestra en cuántos meses llegás guardando en el cajón contra invirtiendo, con el precio de la meta subiendo por la inflación.
- **¿Y si…?**: con lo que te regalaron, qué podrías comprar hoy si lo hubieras invertido hace 6, 12 o 24 meses.
- **Liga del curso**: todos con el mismo mercado (los precios usan una semilla fija) y $100.000 de mentira. El puntaje premia ganarle a la inflación, diversificar y no vender en pánico; resta las caídas fuertes. En la versión publicada con link la liga es compartida (solo se guarda un apodo y el puntaje); en el archivo local muestra una liga de ejemplo.
- **Preguntá sin vergüenza**: asistente para preguntas básicas. En la versión publicada responde Claude; en el archivo local usa respuestas guardadas y el diccionario.
- **Salto con un adulto**: si sos menor, la app arma un mensaje para invitar a tu mamá, papá o tutor a habilitar la cuenta (pendiente confirmar con LBO cómo funciona).

**Precios reales**: `scripts/update_market.py` baja cierres diarios de BYMA (data912.com, con Yahoo Finance de respaldo), la inflación del INDEC y el valor de cuotaparte de un fondo money market (CAFCI vía argentinadatos.com). Corrige splits y datos raros, y guarda todo en `data/mercado.json` y dentro de `index.html`. Lo corre el workflow "Datos de mercado" de GitHub Actions. La actualización automática diaria funciona cuando el workflow está en la rama principal; mientras tanto se puede correr a mano desde Actions o con `python3 scripts/update_market.py`.

El simulador es una **temporada**: todos arrancan el 1/10/2025 con $100.000 de mentira y avanzan por los cierres reales hasta el último día con datos.

Prototipo de app para animarse a invertir: **aprender** con lecciones de 1 minuto, **entender** las palabras raras tocándolas, **practicar** con plata de mentira y **animarse** a dar el primer paso real.

Abrí `index.html` en el navegador (no necesita instalar nada). En la compu se ve como la plataforma web de un broker (barra superior, cinta de cotizaciones, tabla de mercado con panel de operación al costado); en el celular pasa a una columna con barra inferior.

## Publicar en Vercel (versión para la entrega)

En Vercel la app tiene **cuentas reales**: el progreso queda guardado en una base de datos y se abre desde cualquier dispositivo. También hay un **ranking real** entre todas las personas, **cotizaciones de Yahoo Finance** y **Preguntá con IA**. Todo está en este repositorio:

| Parte | Qué hace |
|---|---|
| `public/` (se arma sola con `npm run build`) | `/` versión de PC (en un celular pasa sola a `/celular/`), `/celular/` y `/data/mercado.json` |
| `api/auth.js` | crear cuenta, ingresar, Google, salir, recuperar la contraseña por email y borrar la cuenta. Contraseñas con scrypt y sesiones de 90 días. Frena los intentos repetidos |
| `api/progress.js` | guarda y devuelve el progreso de cada cuenta. Si otro dispositivo guardó algo más nuevo, no lo pisa y la app trae lo nuevo |
| `api/ranking.js` | ranking de todas las cuentas por rendimiento. Muestra nombre e inicial del apellido; los emails nunca salen del servidor |
| `api/quotes.js` | último precio y variación del día de **Yahoo Finance** (tickers `.BA` de BYMA), con puntas y respaldo de data912. Se comparte 15 segundos en la CDN de Vercel |
| `api/ask.js` | Preguntá con IA (Claude), con las reglas de `api/_lib/rules.js`. Pide sesión y limita la cantidad de preguntas por persona |
| `api/health.js` | le dice a la app qué está activo |

### Pasos

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importá este repositorio de GitHub. Vercel detecta `vercel.json` (no hay que tocar nada del build).
2. Elegí como rama de producción (en el proyecto, **Settings → Environments → Production → Branch Tracking**, o **Settings → Git** en paneles más viejos) `claude/investment-app-practice-iu56nt` (o uní la rama a `main`). Cada vez que GitHub Actions actualiza los precios del día, Vercel publica solo.
3. **Base de datos:** en el proyecto → **Storage → Create Database → Upstash (Redis)** → conectala al proyecto. Eso crea solo `KV_REST_API_URL` y `KV_REST_API_TOKEN`. El plan gratis alcanza para la entrega.
4. **IA (opcional):** en **Settings → Environment Variables** agregá `ANTHROPIC_API_KEY` (de console.anthropic.com). Sin la clave, Preguntá usa las respuestas guardadas.
5. **Redeploy** (Deployments → ⋯ → Redeploy) para que tome las variables. Abrí `https://<tu-proyecto>.vercel.app/api/health`: tiene que decir `"accounts": true`.

Variables opcionales:

| Variable | Para qué |
|---|---|
| `GOOGLE_CLIENT_ID` | "Continuar con Google" real. Creá un ID de cliente OAuth (tipo Web) en Google Cloud y agregá tu dominio de Vercel en "Orígenes autorizados de JavaScript". Sin esto, el botón simula Google (pide Gmail y contraseña) |
| `RESEND_API_KEY` y `MAIL_FROM` | Recuperar la contraseña por email con [Resend](https://resend.com) (por ejemplo `MAIL_FROM="Sin Miedo <hola@tudominio.com>"`, con el dominio verificado en Resend). Sin esto, la pantalla avisa que no está activada |
| `AI_MODEL` | Modelo de Claude para Preguntá (por defecto `claude-opus-5-5`) |

Sin la base de datos, la app igual funciona: precios de Yahoo e IA desde el servidor, y cuentas y progreso en el dispositivo.

### Probar en la compu

```bash
npm install
npm test                                   # pruebas de las funciones del servidor
npm run build && MEMORY_ACCOUNTS=1 npm run dev   # http://localhost:3000 con cuentas en memoria
```

`MEMORY_ACCOUNTS=1` activa las cuentas sin Upstash, en una memoria que se borra al cortar el servidor. También sirve `vercel dev` si tenés la CLI de Vercel.

### App de escritorio y de Android con las mismas cuentas

En `prototipo/index.html` poné la dirección del proyecto en `API_BASE` (por ejemplo `const API_BASE = "https://sin-miedo.vercel.app";`), regenerá con `python3 scripts/build_mobile.py` y volvé a armar las apps. Así usan las mismas cuentas, el mismo ranking y los precios de Yahoo.

### Antes de abrirla al público

- **Datos personales y menores (Ley 25.326):** la app guarda nombre, email y progreso. LBO tiene que revisar y completar los términos y la política de privacidad (están marcados "a completar") y definir el consentimiento para menores. Cada persona puede borrar su cuenta (`POST /api/auth` con `action: "delete"`).
- **Términos de uso de los datos de mercado:** Yahoo Finance y data912 no tienen una API oficial con licencia para uso comercial. Para una app pública de LBO conviene reemplazarlas por un proveedor con licencia (por ejemplo, el feed de BYMA). El cambio es solo en `api/quotes.js`.
- **Ranking:** el rendimiento lo calcula la app con la cartera de práctica y el servidor controla que los números sean razonables. Una persona con conocimientos técnicos podría mandar un resultado falso: para premios reales habría que calcularlo en el servidor.
- **IA:** cada pregunta tiene costo en la cuenta de Anthropic. Hay un límite de 15 preguntas cada 10 minutos y 120 por día por persona (`api/ask.js`).

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

## App para celular (Android)

`celular/index.html` es la versión para celular en vertical: pestañas abajo, barra superior con la cuenta y todo en una columna. No se edita a mano: se genera desde el prototipo con `python3 scripts/build_mobile.py`, que le suma `celular/movil.css` y algunos ajustes táctiles (el workflow de datos la regenera cada día).

- El workflow "Sin Miedo para Android" arma un `.apk` con Capacitor cada vez que cambia el prototipo o la versión para celular (o a mano con "Run workflow"). Se descarga desde "Artifacts" (Sin-Miedo-Android) y se instala en el celular aceptando instalar apps de esta fuente.
- En la app, las cotizaciones en vivo, las cuentas y el progreso funcionan igual que en el escritorio. El asistente usa las respuestas guardadas (la IA solo está en claude.ai).
- Para iPhone hace falta una cuenta de desarrollador de Apple; mientras tanto se puede abrir `celular/index.html` publicado en una web.

## App de escritorio (Windows)

La carpeta `desktop/` convierte el **prototipo** (`prototipo/index.html`) en una app de escritorio con [Electron](https://www.electronjs.org/).

- Se arma sola en GitHub Actions (workflow "Sin Miedo para Windows") cada vez que cambia el prototipo o `desktop/`, o a mano con "Run workflow". El resultado se descarga desde la sección "Artifacts" de la ejecución (Sin-Miedo-Windows): descomprimir y abrir "Sin Miedo.exe".
- También se puede armar desde Linux o Mac con `./desktop/build-windows.sh`.
- Con internet, la app trae los precios nuevos de `data/mercado.json` (copia pública en GitHub, `DATA_URL` en el prototipo); sin internet usa los que trae incluidos. Si el repositorio pasa a ser privado o cambia la rama, hay que actualizar `DATA_URL`.
- F11 pone pantalla completa para presentar.

## Traste (carpeta `traste/`)

App aparte para aprender guitarra desde cero (Vite + JavaScript, instalable como PWA). Ver [traste/README.md](traste/README.md):

```bash
cd traste
npm install
npm run dev
```

## Prototipo de diseño para escritorio (`prototipo/`)

`prototipo/index.html` es un prototipo navegable para presentar en LBO, pensado para pantalla de escritorio (1440x900). Los precios del simulador son **reales** (cierres diarios de BYMA, ver "Datos de mercado"). Los ejemplos que no son datos de mercado están marcados como tales.

Pantallas: landing, registro/ingreso (Google o email), diagnóstico, inicio, Aprender (camino de 6 niveles), lección, ¿Es estafa? (detector con semáforo), simulador, Preguntá sin vergüenza y El salto. El botón "Mapa del prototipo" (o la tecla M) permite saltar a cualquier pantalla durante la presentación.

### Cuentas: Google o email

Al comenzar, cada usuario entra con **"Continuar con Google"** (también desde la landing, "Empezar con Google") o con nombre, email y contraseña. Cada cuenta tiene su propio progreso (niveles, XP, racha, cartera de práctica).

Dónde se guardan las cuentas depende de dónde se abra la app:

- **Publicada en Vercel:** cuentas reales en el servidor (ver "Publicar en Vercel"). "Continuar con Google" es real si está `GOOGLE_CLIENT_ID`; si no, se simula (Gmail y contraseña, y el nombre la primera vez).
- **En claude.ai:** cuentas del navegador, y el progreso se copia en la base privada de cada persona (capacidad `db`).
- **Archivo suelto o app de escritorio:** las cuentas se guardan en el navegador (`localStorage`), con la contraseña hasheada (SHA-256). Sirve para la demo, pero cada cuenta existe solo en ese dispositivo. Con `AUTH_CFG.googleClientId` el ingreso con Google es real, si el archivo se abre desde un dominio autorizado.

Antes de usarlo con usuarios reales (y menores de edad) hace falta que LBO revise la política de privacidad y el tratamiento de datos personales (Ley 25.326). El texto de los términos está marcado "a completar".

### Onboarding, inicio y primera inversión guiada

- **Onboarding en 3 pasos:** dos preguntas (experiencia y qué te frena) y una pantalla de "así funciona" con el botón para empezar la primera inversión guiada (o aprender primero).
- **El inicio es el simulador.** El menú queda en Inicio, Aprender y Ranking; "Preguntá" está en la esfera.
- **Guía de la primera inversión:** hasta la primera compra, cada pantalla muestra un cartel "paso N de 4" y resalta qué tocar: Invertir → elegir (sugiere el Fondo Money Market) → Comprar → monto, revisar y confirmar. Al ejecutarse la compra hay un festejo con los próximos pasos. Se puede saltar con "Saltar la guía" (`S.guideOff`).

### Primeros pasos, inicio y ranking

- **Bienvenida:** después del diagnóstico, una pantalla muestra todo lo que se puede hacer y recomienda por dónde arrancar según el freno elegido.
- **Inicio:** lo principal es "Tu próximo paso" y "Tu camino" (6 pasos: nivel 1, primera compra, detector, una pregunta, los 6 niveles y el salto). Las cuentas nuevas arrancan de cero y la racha cuenta los días seguidos reales.
- **Ranking:** ordena por rendimiento de la cartera de práctica desde que cada persona empezó. En Vercel es entre todas las cuentas (`api/ranking.js`). En claude.ai cada persona publica su resultado en la colección compartida `ranking` (solo puede escribir el suyo, regla `ranking/{self}`) y todos ven la tabla; se puede dejar de aparecer. Como archivo o app se arma con las cuentas del dispositivo. Con menos de 3 personas se muestran filas marcadas "ejemplo".
- **Contraseña:** "¿Te olvidaste la contraseña?" en Ingresar. En Vercel manda un link por email (con Resend configurado); en el prototipo local se crea una nueva en la misma pantalla (avisándolo). Se entra con email y contraseña, o con Google; el nombre es solo para saludar.

### Asistente con IA y progreso guardado

- **Preguntá** (dentro de la esfera flotante, pestaña "Preguntá") responde cualquier pregunta con IA (Claude): en Vercel a través de `api/ask.js` y en claude.ai con la capacidad `sample`. Las instrucciones están en `AI_RULES`: voseo, respuestas cortas, nunca promete ganancias ni recomienda qué comprar, avisa que no tiene datos en vivo y no inventa datos de LBO. Como archivo suelto o app de escritorio usa las respuestas guardadas (`ANSWERS`).
- **Progreso:** siempre se guarda en el navegador. En Vercel además se guarda en la cuenta, en el servidor. En claude.ai además se guarda en la base privada de cada persona (capacidad `db`, `data/users/<id>`), así vuelve aunque se borre el navegador o se entre desde otro dispositivo. La barra lateral muestra dónde quedó guardado.

### Aprender (más lúdico)

XP por nivel (+50, +20 si respondés bien al primer intento), estrellas, meta diaria, niveles de jugador, insignias y un cofre. La **esfera flotante** ("¿Qué querés aprender hoy?") abre micro-lecciones de 1 minuto con una pregunta y XP.

### Cotizaciones en vivo

En Vercel el simulador trae el último precio y la variación del día de **Yahoo Finance** (vía `api/quotes.js`), con las puntas de BYMA. En la app de escritorio y abriendo el archivo en el navegador, trae las cotizaciones de BYMA desde data912.com (último precio, puntas, volumen y variación del día): cada 20 segundos con el mercado abierto y cada 5 minutos cerrado. Las órdenes a mercado se ejecutan a las puntas reales y las limitadas pendientes se revisan con cada actualización. Pueden tener unos minutos de demora. En claude.ai el navegador bloquea las conexiones a otros sitios, así que ahí se usan los precios de cierre. Si la fuente no responde, también se usan los cierres y se reintenta solo.

### Simulador día a día con datos reales

- Plata de mentira ($1.000.000), precios **reales** de cierre. No se adelanta el tiempo: cada día hábil, después del cierre, entran los precios nuevos y la cartera cambia sola. Las órdenes limitadas pendientes se ejecutan si el cierre del día las alcanza.
- Las órdenes a mercado se ejecutan al último cierre real. Las puntas compradora/vendedora son **estimadas** a partir del cierre (no son cotizaciones en vivo).
- Comprar y vender se hace desde un **drawer lateral** con el ticket completo (tipo de orden, cantidad o monto, plazo, comisión 0,5%, derechos 0,08%, IVA).
- "¿Qué tan buen inversor sos?": un puntaje de 0 a 100 que premia ganarle a la inflación, diversificar e invertir, y resta las caídas fuertes. Se empieza a calcular después del primer día de mercado.
- Para que los datos nuevos lleguen solos, el prototipo tiene que estar publicado (por ejemplo, GitHub Pages): al abrirse busca `data/mercado.json`, que el workflow "Datos de mercado" actualiza cada día. Si se abre como archivo suelto usa los datos que tenía al descargarse.
- Los activos y parámetros de respaldo están en `BROKER_CFG`. La Lecap se elige automáticamente entre las vigentes (`LECAP_CANDIDATES` en `scripts/update_market.py`).
