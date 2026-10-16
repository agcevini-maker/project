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

"Continuar con Google" funciona de tres maneras según `AUTH_CFG`:

- **Sin configurar (por defecto):** modo prototipo. No abre Google: un aviso lo dice y se escribe el Gmail para simular el ingreso.
- **`googleClientId`:** ingreso real con Google (Google Identity Services) y progreso guardado en el dispositivo. Requiere un ID de cliente OAuth creado en Google Cloud, con el dominio donde se publica en "Orígenes autorizados", y abrir el prototipo desde ese dominio (no como archivo suelto).
- **Supabase:** activá Google como proveedor en Supabase (Authentication → Providers) y el progreso se guarda en la nube.

- **Modo local (por defecto):** las cuentas se guardan en el navegador (`localStorage`), con la contraseña hasheada (SHA-256). Sirve para la demo, pero cada cuenta existe solo en ese dispositivo y navegador. No es un sistema de cuentas real.
- **Modo nube (Supabase):** completá `AUTH_CFG` (`supabaseUrl` y `supabaseAnonKey`) en el archivo y creá esta tabla:

```sql
create table progreso (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table progreso enable row level security;
create policy "cada uno ve lo suyo" on progreso for select using (auth.uid() = user_id);
create policy "cada uno guarda lo suyo" on progreso for insert with check (auth.uid() = user_id);
create policy "cada uno actualiza lo suyo" on progreso for update using (auth.uid() = user_id);
```

Antes de usarlo con usuarios reales (y menores de edad) hace falta que LBO revise la política de privacidad y el tratamiento de datos personales (Ley 25.326). El texto de los términos está marcado "a completar".

### Asistente con IA y progreso guardado

- **Preguntá** responde cualquier pregunta con IA (Claude) cuando el prototipo se abre publicado en claude.ai (capacidad `sample`). Las instrucciones están en `AI_RULES`: voseo, respuestas cortas, nunca promete ganancias ni recomienda qué comprar, avisa que no tiene datos en vivo y no inventa datos de LBO. Como archivo suelto o app de escritorio usa las respuestas guardadas (`ANSWERS`).
- **Progreso:** siempre se guarda en el navegador. En claude.ai además se guarda en la base privada de cada persona (capacidad `db`, `data/users/<id>`), así vuelve aunque se borre el navegador o se entre desde otro dispositivo. La barra lateral muestra dónde quedó guardado.

### Aprender (más lúdico)

XP por nivel (+50, +20 si respondés bien al primer intento), estrellas, meta diaria, niveles de jugador, insignias y un cofre. La **esfera flotante** ("¿Qué querés aprender hoy?") abre micro-lecciones de 1 minuto con una pregunta y XP.

### Cotizaciones en vivo

En la app de escritorio y abriendo el archivo en el navegador, el simulador trae las cotizaciones de BYMA desde data912.com (último precio, puntas, volumen y variación del día): cada 20 segundos con el mercado abierto y cada 5 minutos cerrado. Las órdenes a mercado se ejecutan a las puntas reales y las limitadas pendientes se revisan con cada actualización. Pueden tener unos minutos de demora. En claude.ai el navegador bloquea las conexiones a otros sitios, así que ahí se usan los precios de cierre. Si la fuente no responde, también se usan los cierres y se reintenta solo.

### Simulador día a día con datos reales

- Plata de mentira ($1.000.000), precios **reales** de cierre. No se adelanta el tiempo: cada día hábil, después del cierre, entran los precios nuevos y la cartera cambia sola. Las órdenes limitadas pendientes se ejecutan si el cierre del día las alcanza.
- Las órdenes a mercado se ejecutan al último cierre real. Las puntas compradora/vendedora son **estimadas** a partir del cierre (no son cotizaciones en vivo).
- Comprar y vender se hace desde un **drawer lateral** con el ticket completo (tipo de orden, cantidad o monto, plazo, comisión 0,5%, derechos 0,08%, IVA).
- "¿Qué tan buen inversor sos?": un puntaje de 0 a 100 que premia ganarle a la inflación, diversificar e invertir, y resta las caídas fuertes. Se empieza a calcular después del primer día de mercado.
- Para que los datos nuevos lleguen solos, el prototipo tiene que estar publicado (por ejemplo, GitHub Pages): al abrirse busca `data/mercado.json`, que el workflow "Datos de mercado" actualiza cada día. Si se abre como archivo suelto usa los datos que tenía al descargarse.
- Los activos y parámetros de respaldo están en `BROKER_CFG`. La Lecap se elige automáticamente entre las vigentes (`LECAP_CANDIDATES` en `scripts/update_market.py`).
