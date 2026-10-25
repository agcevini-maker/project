// Ayudas comunes de las funciones: respuestas JSON, CORS, cuerpo del pedido, sesión y límites de uso.
import crypto from "node:crypto";
import { db, getJSON } from "./store.js";

export const SESSION_DAYS = 90;

// La app de escritorio y la de Android llaman a la API desde otro origen, por eso CORS abierto.
// No se usan cookies (la sesión viaja en el encabezado Authorization), así que "*" es seguro.
export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export function send(res, status, body, headers = {}) {
  cors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!headers["Cache-Control"]) res.setHeader("Cache-Control", "no-store");
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(body));
}
export const fail = (res, status, error, extra = {}) => send(res, status, { ok: false, error, ...extra });

// Vercel ya parsea el JSON en req.body; en las pruebas puede venir sin parsear.
export async function readBody(req, limit = 300_000) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") { if (req.body.length > limit) throw new Error("too_large"); return req.body ? JSON.parse(req.body) : {}; }
    if (Buffer.isBuffer(req.body)) { if (req.body.length > limit) throw new Error("too_large"); return JSON.parse(req.body.toString("utf8") || "{}"); }
    return req.body;
  }
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw new Error("too_large"); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

// Ejecuta el manejador con CORS, OPTIONS y errores inesperados resueltos.
export function handler(methods, fn) {
  return async (req, res) => {
    cors(res);
    if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
    if (!methods.includes(req.method)) return fail(res, 405, "Método no permitido.");
    try { return await fn(req, res); }
    catch (e) {
      if (e?.message === "too_large") return fail(res, 413, "Los datos son demasiado grandes.");
      if (e instanceof SyntaxError) return fail(res, 400, "Los datos no tienen el formato esperado.");
      console.error(e);
      return fail(res, 500, "Algo falló en el servidor. Probá de nuevo en un momento.");
    }
  };
}

export const normEmail = e => String(e || "").trim().toLowerCase().slice(0, 254);
export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const cleanName = n => String(n || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 30);
export const userKey = email => "user:" + email;

export function ip(req) {
  const f = req.headers["x-forwarded-for"];
  return (Array.isArray(f) ? f[0] : String(f || "")).split(",")[0].trim() || req.socket?.remoteAddress || "local";
}

// Cuenta pedidos por ventana de tiempo. Devuelve true si se pasó del límite.
export async function limited(kind, who, max, windowSec) {
  const k = `rl:${kind}:${who}`;
  const n = await db().incr(k);
  if (n === 1) await db().expire(k, windowSec);
  return n > max;
}

export function newToken() { return crypto.randomBytes(32).toString("base64url"); }
const tokenKey = t => "sess:" + crypto.createHash("sha256").update(t).digest("hex");

export async function createSession(email) {
  const t = newToken();
  await db().set(tokenKey(t), email, { ex: SESSION_DAYS * 86400 });
  return t;
}
export async function endSession(t) { if (t) await db().del(tokenKey(t)); }
export function bearer(req) {
  const h = String(req.headers.authorization || "");
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}
// Devuelve { email, user } de la sesión, o null.
export async function sessionUser(req) {
  const t = bearer(req);
  if (!t || t.length > 200) return null;
  const email = await db().get(tokenKey(t));
  if (!email) return null;
  const user = await getJSON(userKey(email));
  return user ? { email, user, token: t } : null;
}

// Contraseñas: scrypt con sal aleatoria (nunca se guarda la contraseña).
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${h.toString("base64")}`;
}
export function checkPassword(pw, stored) {
  if (!stored || !stored.startsWith("scrypt$")) return false;
  const [, s, h] = stored.split("$");
  const want = Buffer.from(h, "base64");
  const got = crypto.scryptSync(pw, Buffer.from(s, "base64"), want.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(want, got);
}
