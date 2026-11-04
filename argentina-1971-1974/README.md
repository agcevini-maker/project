# Argentina 1971–1974

Página educativa e interactiva: línea de tiempo del retorno del peronismo y la crisis política (1971–1974).

Es un sitio estático: `index.html`, `styles.css`, `app.js` y `favicon.svg`. No necesita instalar nada ni compilar.

- **Verla en la compu:** abrir `index.html` en el navegador.
- **Editar contenido:** los acontecimientos están en el arreglo `EVENTS`, al principio de `app.js`.

## Publicar en Vercel

Esta carpeta se publica como un **proyecto de Vercel aparte**, sin tocar la app "Sin Miedo" que está en la raíz del repositorio.

### Opción A: desde la web de Vercel (recomendada)

1. Entrar a https://vercel.com/new e importar el repositorio `agcevini-maker/project`.
2. En **Root Directory** tocar *Edit* y elegir `argentina-1971-1974`.
3. **Framework Preset:** `Other`. Dejar vacíos *Build Command*, *Output Directory* e *Install Command*.
4. Si el sitio se publica desde esta rama y no desde la principal, elegirla en *Settings → Git → Production Branch*, o hacer merge de la rama primero.
5. Tocar **Deploy**. Vercel da una dirección del tipo `https://<nombre>.vercel.app`.

Cada `git push` a esa rama vuelve a publicar el sitio solo.

### Opción B: desde la terminal

```bash
npm i -g vercel
cd argentina-1971-1974
vercel          # vista previa (la primera vez pregunta cuenta y nombre del proyecto)
vercel --prod   # publicación definitiva
```

`vercel.json` ya trae la configuración: sitio estático sin compilación, direcciones sin `.html` y encabezados de seguridad.

## Imágenes

Las tarjetas usan ilustraciones propias. Para sumar fotos históricas, completar `image` y `credit` en cada acontecimiento de `app.js`, usando solo archivos de dominio público o con licencia libre y citando la fuente.
