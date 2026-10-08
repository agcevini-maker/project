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
4. **Modo práctica**: se desbloquea al terminar el nivel 3. $100.000 virtuales repartidos en 3 perfiles (tranquila / intermedia / movida), avanzando de a 1 día o 1 mes.
5. **El salto**: al terminar el camino, propone un monto chico para hacer lo mismo con plata real en LBO.

El progreso se guarda en el navegador (localStorage). "Reiniciar" lo borra.

## Pendientes antes de mostrarlo

- **Nivel 4 y modo práctica usan categorías genéricas** (plazo fijo, fondos, bonos, acciones). Reemplazarlas por los productos reales de LBO después de la reunión con Lautaro.
- Los rendimientos de la práctica son **inventados** y aleatorios; no representan datos de mercado.
- El botón "Hacerlo en LBO" no lleva a ningún lado todavía.
- El contenido de las lecciones es un borrador: conviene que alguien de LBO lo revise antes de usarlo.
