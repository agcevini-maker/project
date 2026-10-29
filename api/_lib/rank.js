// Ranking compartido. El rendimiento lo calcula el servidor (portfolio.js) con las órdenes guardadas de cada
// cuenta y los cierres reales del día; la app solo aporta el nombre visible y su nivel de inversor.
// Se identifica a cada persona con un código derivado del email: el email nunca sale del servidor.
import crypto from "node:crypto";
import { db, getJSON } from "./store.js";
import { evaluate } from "./portfolio.js";

export const rid = email => crypto.createHash("sha256").update("rank:" + email).digest("hex").slice(0, 20);
export const rankName = name => { const n = String(name || "").trim().split(/\s+/); return (n[0] || "Inversor").slice(0, 20) + (n[1] ? " " + n[1][0].toUpperCase() + "." : ""); };
const num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;

// Arma la fila con el cálculo del servidor. null si la cuenta no entra (sin compras, salió del ranking o no cierra).
export function entryFor(state, name, md) {
  if (!state || state.rankOff) return null;
  const ev = evaluate(state.bk, md);
  if (!ev.ok) return null;
  const score = num(state.rankScore, 0, 100) ? Math.round(state.rankScore) : null;
  const tier = String(state.rankTier || "").replace(/[<>]/g, "").slice(0, 20);
  return { name: rankName(state.name || name), ret: Math.round(ev.ret * 1e5) / 1e5, score: ev.days ? score : null, tier, days: ev.days, asOf: ev.asOf, at: new Date().toISOString() };
}

export async function setRank(email, entry) {
  const id = rid(email);
  if (!entry) return removeRank(email);
  await Promise.all([
    db().zadd("rank", { score: entry.ret, member: id }),
    db().hset("rankinfo", { [id]: JSON.stringify(entry) }),
    db().hset("rankuser", { [id]: email })
  ]);
}
export async function removeRank(email) {
  const id = rid(email);
  await Promise.all([db().zrem("rank", id), db().hdel("rankinfo", id), db().hdel("rankuser", id)]);
}

// Las filas calculadas con cierres de un día anterior se rehacen con los precios nuevos.
async function refreshStale(md) {
  const all = await db().hgetall("rankinfo");
  const stale = Object.entries(all || {}).filter(([, v]) => { try { return (typeof v === "string" ? JSON.parse(v) : v).asOf !== md.asOf; } catch (e) { return true; } }).map(([id]) => id).slice(0, 200);
  if (!stale.length) return;
  const emails = await db().hmget("rankuser", ...stale);
  await Promise.all(stale.map(async (id, i) => {
    const email = emails[i];
    if (!email) { await Promise.all([db().zrem("rank", id), db().hdel("rankinfo", id)]); return; }
    const [prog, user] = await Promise.all([getJSON("prog:" + email), getJSON("user:" + email)]);
    const e = user ? entryFor(prog?.data, user.name, md) : null;
    if (e) await setRank(email, e); else await removeRank(email);
  }));
}

export async function topRanking(limit, email, md) {
  if (md) await refreshStale(md).catch(e => console.error("ranking:", e.message));
  const ids = await db().zrange("rank", 0, limit - 1, { rev: true });
  const infos = ids.length ? await db().hmget("rankinfo", ...ids) : [];
  const me = email ? rid(email) : null;
  const parse = x => typeof x === "string" ? JSON.parse(x) : x;
  const rows = ids.map((id, i) => { try { const x = parse(infos[i]); return x ? { name: x.name, ret: x.ret, score: x.score, tier: x.tier, days: x.days, me: id === me, pos: i + 1 } : null; } catch (e) { return null; } }).filter(Boolean);
  let mine = null;
  if (me && !rows.some(r => r.me)) {
    const pos = await db().zrevrank("rank", me);
    if (pos != null) { const [x] = await db().hmget("rankinfo", me); if (x) { const y = parse(x); mine = { name: y.name, ret: y.ret, score: y.score, tier: y.tier, days: y.days, me: true, pos: pos + 1 }; } }
  }
  return { rows, mine, total: await db().zcard("rank"), asOf: md?.asOf || null };
}
