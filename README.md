# Sin Miedo — prototipo

Prototipo de app para animarse a invertir: **aprender** con lecciones de 1 minuto, **entender** las palabras raras tocándolas, **practicar** con plata de mentira y **animarse** a dar el primer paso real.

Abrí `index.html` en el navegador (no necesita instalar nada). Está pensado para verse en el celular.

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

El progreso se guarda en el navegador (localStorage). "Reiniciar" lo borra.

## Pendientes antes de mostrarlo

- **El simulador usa activos de ejemplo** (fondos genéricos y algunos bonos, CEDEARs y acciones conocidos). Ajustar la lista a los productos reales de LBO después de la reunión con Lautaro.
- **Los precios, la comisión (0,6%) y los movimientos son inventados** y aleatorios; no son cotizaciones reales.
- El botón "Hacerlo en LBO" no lleva a ningún lado todavía.
- El contenido de las lecciones es un borrador: conviene que alguien de LBO lo revise antes de usarlo.
