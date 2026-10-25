// Ranking compartido: un conjunto ordenado por rendimiento y los datos visibles de cada fila.
// Se identifica a cada persona con un código derivado del email: el email nunca sale del servidor.
import crypto from "node:crypto";
import { db } from "./store.js";

export const rid = email => crypto.createHash("sha256").update("rank:" + email).digest("hex").slice(0, 20);
const num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;

// La app calcula la fila con su cartera; acá se controla que los números tengan sentido.
export function cleanEntry(e, name) {
  if (!e || typeof e !== "object") return null;
  if (!num(e.ret, -1, 20) || !num(e.days, 0, 3650)) return null;
  const score = e.score == null ? null : num(e.score, 0, 100) ? Math.round(e.score) : null;
  const tier = String(e.tier || "").replace(/[<>]/g, "").slice(0, 20);
  return { name: String(name || "Inversor").slice(0, 24), ret: Math.round(e.ret * 1e5) / 1e5, score, tier, days: Math.round(e.days), at: new Date().toISOString() };
}

export async function setRank(email, entry) {
  const id = rid(email);
  if (!entry) return removeRank(email);
  await Promise.all([db().zadd("rank", { score: entry.ret, member: id }), db().hset("rankinfo", { [id]: JSON.stringify(entry) })]);
}
export async function removeRank(email) {
  const id = rid(email);
  await Promise.all([db().zrem("rank", id), db().hdel("rankinfo", id)]);
}

export async function topRanking(limit, email) {
  const ids = await db().zrange("rank", 0, limit - 1, { rev: true });
  const infos = ids.length ? await db().hmget("rankinfo", ...ids) : [];
  const me = email ? rid(email) : null;
  const rows = ids.map((id, i) => { try { const x = typeof infos[i] === "string" ? JSON.parse(infos[i]) : infos[i]; return x ? { ...x, me: id === me } : null; } catch (e) { return null; } }).filter(Boolean);
  let mine = null;
  if (me && !rows.some(r => r.me)) {
    const pos = await db().zrevrank("rank", me);
    if (pos != null) { const [x] = await db().hmget("rankinfo", me); if (x) mine = { ...(typeof x === "string" ? JSON.parse(x) : x), me: true, pos: pos + 1 }; }
  }
  return { rows, mine, total: await db().zcard("rank") };
}
