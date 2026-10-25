// Arma la carpeta public/ que publica Vercel:
//   /            versión de PC (prototipo/index.html); en un celular pasa sola a /celular/
//   /celular/    versión para celular (celular/index.html, generada por scripts/build_mobile.py)
//   /data/       datos de mercado del día (data/mercado.json, los actualiza GitHub Actions)
// Las funciones de servidor están en api/ y Vercel las publica solas.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(OUT, p)), { recursive: true }); fs.writeFileSync(path.join(OUT, p), s); };

fs.rmSync(OUT, { recursive: true, force: true });

let pc = read("prototipo/index.html");
const toPhone = `<script>/* En pantallas angostas se abre la versión para celular (con ?pc se queda en esta). */
try { if (matchMedia("(max-width: 700px)").matches && !/[?&]pc\\b/.test(location.search)) location.replace("celular/" + location.search + location.hash); } catch (e) {}</script>`;
if (!pc.includes("<title>Sin Miedo · prototipo</title>")) throw new Error("No encontré el título del prototipo.");
pc = pc.replace("<title>Sin Miedo · prototipo</title>", `<title>Sin Miedo</title>\n${toPhone}\n<link rel="icon" href="icon.png">\n<meta name="description" content="Aprendé a invertir sin miedo: lecciones cortas y un simulador con precios reales de BYMA. Una app educativa de LBO.">`);
write("index.html", pc);

let phone = read("celular/index.html").replace("<title>Sin Miedo</title>", `<title>Sin Miedo</title>\n<link rel="icon" href="../icon.png">`);
write("celular/index.html", phone);
write("data/mercado.json", read("data/mercado.json"));
fs.copyFileSync(path.join(ROOT, "desktop/icon.png"), path.join(OUT, "icon.png"));

const kb = p => Math.round(fs.statSync(path.join(OUT, p)).size / 1024);
console.log(`public/ lista: index.html ${kb("index.html")} KB · celular/index.html ${kb("celular/index.html")} KB · data/mercado.json ${kb("data/mercado.json")} KB`);
