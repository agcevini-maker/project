// Base de datos de la app: Upstash Redis (se conecta desde Vercel → Storage → Upstash).
// Sin las variables de entorno usa una memoria temporal: sirve para probar, pero se borra
// cada vez que la función se reinicia, así que /api/health avisa y la app sigue guardando en el dispositivo.
import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

function memoryStore() {
  const kv = new Map(), zsets = new Map(), hashes = new Map();
  const live = k => { const e = kv.get(k); if (e && e.exp && e.exp < Date.now()) { kv.delete(k); return null; } return e; };
  return {
    kind: "memory",
    async get(k) { return live(k)?.v ?? null; },
    async set(k, v, opts = {}) {
      if (opts.nx && live(k)) return null;
      kv.set(k, { v, exp: opts.ex ? Date.now() + opts.ex * 1000 : 0 }); return "OK";
    },
    async del(k) { kv.delete(k); hashes.delete(k); zsets.delete(k); return 1; },
    async incr(k) { const e = live(k); const n = (e ? +e.v : 0) + 1; kv.set(k, { v: n, exp: e?.exp || 0 }); return n; },
    async expire(k, s) { const e = live(k); if (e) e.exp = Date.now() + s * 1000; return 1; },
    async zadd(k, { score, member }) { if (!zsets.has(k)) zsets.set(k, new Map()); zsets.get(k).set(member, score); return 1; },
    async zrem(k, m) { zsets.get(k)?.delete(m); return 1; },
    async zrange(k, start, stop, opts = {}) {
      const arr = [...(zsets.get(k) || new Map())].sort((a, b) => opts.rev ? b[1] - a[1] : a[1] - b[1]).map(x => x[0]);
      return arr.slice(start, stop < 0 ? arr.length + stop + 1 : stop + 1);
    },
    async zrevrank(k, m) {
      const arr = [...(zsets.get(k) || new Map())].sort((a, b) => b[1] - a[1]).map(x => x[0]);
      const i = arr.indexOf(m); return i < 0 ? null : i;
    },
    async zcard(k) { return zsets.get(k)?.size || 0; },
    async hset(k, obj) { if (!hashes.has(k)) hashes.set(k, new Map()); Object.entries(obj).forEach(([f, v]) => hashes.get(k).set(f, v)); return 1; },
    async hdel(k, f) { hashes.get(k)?.delete(f); return 1; },
    async hmget(k, ...fs) { const h = hashes.get(k) || new Map(); return fs.map(f => h.get(f) ?? null); }
  };
}

let store;
export function db() {
  if (store) return store;
  if (url && token) {
    const r = new Redis({ url, token, automaticDeserialization: false });
    store = {
      kind: "redis",
      get: k => r.get(k),
      set: (k, v, o = {}) => r.set(k, v, { ...(o.ex ? { ex: o.ex } : {}), ...(o.nx ? { nx: true } : {}) }),
      del: k => r.del(k),
      incr: k => r.incr(k),
      expire: (k, s) => r.expire(k, s),
      zadd: (k, e) => r.zadd(k, e),
      zrem: (k, m) => r.zrem(k, m),
      zrange: (k, a, b, o = {}) => r.zrange(k, a, b, o.rev ? { rev: true } : undefined),
      zrevrank: (k, m) => r.zrevrank(k, m),
      zcard: k => r.zcard(k),
      hset: (k, o) => r.hset(k, o),
      hdel: (k, f) => r.hdel(k, f),
      hmget: (k, ...fs) => fs.length ? r.hmget(k, ...fs).then(x => Array.isArray(x) ? x : fs.map(f => x?.[f] ?? null)) : Promise.resolve([])
    };
  } else {
    store = memoryStore();
  }
  return store;
}

// Para las pruebas: arranca con una memoria limpia.
export function resetMemoryStore() { store = memoryStore(); return store; }

export const getJSON = async k => { const v = await db().get(k); if (v == null) return null; try { return typeof v === "string" ? JSON.parse(v) : v; } catch (e) { return null; } };
export const setJSON = (k, v, o) => db().set(k, JSON.stringify(v), o);
