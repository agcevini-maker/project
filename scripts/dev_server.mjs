// Servidor local que imita a Vercel: sirve public/ y las funciones de api/.
// Uso:  npm run build && npm run dev   →  http://localhost:3000
// Sin variables de Upstash usa una memoria temporal; con MEMORY_ACCOUNTS=1 igual activa las cuentas para probar.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const PORT = +process.env.PORT || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".png": "image/png", ".js": "text/javascript", ".css": "text/css" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5).replace(/[^a-z0-9_-]/gi, "");
    const file = path.join(ROOT, "api", name + ".js");
    if (!name || name.startsWith("_") || !fs.existsSync(file)) { res.statusCode = 404; return res.end("{}"); }
    req.query = Object.fromEntries(url.searchParams);
    if (["POST", "PUT"].includes(req.method)) {
      const chunks = []; for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString("utf8");
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = raw; }
    }
    const mod = await import(pathToFileURL(file).href);
    return mod.default(req, res);
  }
  let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  let f = path.join(PUB, p);
  if (!f.startsWith(PUB)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.statusCode = 404; return res.end("No encontrado"); }
  res.setHeader("Content-Type", TYPES[path.extname(f)] || "application/octet-stream");
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`Sin Miedo en http://localhost:${PORT}`));
