// Pruebas de las funciones de servidor con la memoria temporal (sin Upstash ni internet).
// Correr con:  npm test
import test from "node:test";
import assert from "node:assert/strict";
import { resetMemoryStore } from "../api/_lib/store.js";
import auth from "../api/auth.js";
import progress from "../api/progress.js";
import ranking from "../api/ranking.js";
import health from "../api/health.js";
import ask from "../api/ask.js";
import quotesFn from "../api/quotes.js";

function call(fn, { method = "GET", body, token, query = {}, url = "/" } = {}) {
  return new Promise((resolve, reject) => {
    const headers = { "x-forwarded-for": "1.2.3.4", host: "localhost" };
    if (token) headers.authorization = "Bearer " + token;
    const req = { method, headers, body, query, url, on() {}, socket: {} };
    const res = { statusCode: 200, h: {}, out: "", setHeader(k, v) { this.h[k.toLowerCase()] = v; }, write(x) { this.out += x; }, end(x) { if (x) this.out += x; this.writableEnded = true; let data; try { data = JSON.parse(this.out); } catch (e) { data = this.out; } resolve({ status: this.statusCode, data, headers: this.h }); } };
    Promise.resolve(fn(req, res)).catch(reject);
  });
}

test("health informa la memoria temporal sin cuentas", async () => {
  resetMemoryStore();
  const r = await call(health);
  assert.equal(r.status, 200);
  assert.equal(r.data.db, "memory");
  assert.equal(r.data.accounts, false);
  assert.equal(r.data.ai, false);
});

test("crear cuenta, ingresar, guardar y recuperar el progreso", async () => {
  resetMemoryStore();
  let r = await call(auth, { method: "POST", body: { action: "signup", name: "Agus Prueba", email: "Agus@Example.com", password: "12345678" } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.ok(r.data.token);
  assert.equal(r.data.user.email, "agus@example.com");
  assert.equal(r.data.state, null);

  r = await call(auth, { method: "POST", body: { action: "signup", name: "Otra", email: "agus@example.com", password: "12345678" } });
  assert.equal(r.status, 409);

  r = await call(auth, { method: "POST", body: { action: "login", email: "agus@example.com", password: "malmalmal" } });
  assert.equal(r.status, 401);
  r = await call(auth, { method: "POST", body: { action: "login", email: "AGUS@example.com", password: "12345678" } });
  assert.equal(r.status, 200);
  const tk = r.data.token;

  r = await call(progress, { method: "PUT", token: tk, body: { state: { name: "Agus Prueba", xp: 40 }, base: null, rank: { ret: 0.0312, score: 70, tier: "Prudente", days: 3 } } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const at1 = r.data.savedAt;

  // Otro dispositivo con una versión vieja no pisa lo nuevo.
  r = await call(progress, { method: "PUT", token: tk, body: { state: { xp: 1 }, base: null } });
  assert.equal(r.status, 409);
  assert.equal(r.data.state.xp, 40);

  r = await call(progress, { method: "PUT", token: tk, body: { state: { name: "Agus Prueba", xp: 55 }, base: at1, rank: { ret: 0.05, score: 72, tier: "Prudente", days: 4 } } });
  assert.equal(r.status, 200);

  r = await call(progress, { token: tk });
  assert.equal(r.data.state.xp, 55);
  assert.equal(r.data.user.name, "Agus Prueba");

  r = await call(progress, { token: "inventado" });
  assert.equal(r.status, 401);
});

test("ranking con todas las cuentas, sin exponer emails", async () => {
  resetMemoryStore();
  const mk = async (name, email, ret) => {
    const r = await call(auth, { method: "POST", body: { action: "signup", name, email, password: "12345678" } });
    await call(progress, { method: "PUT", token: r.data.token, body: { state: { name }, base: null, rank: { ret, score: null, tier: "", days: 0 } } });
    return r.data.token;
  };
  const a = await mk("Ana Pérez", "ana@x.com", 0.02);
  await mk("Beto", "beto@x.com", 0.05);
  const c = await mk("Caro", "caro@x.com", -0.01);
  let r = await call(ranking, { token: a });
  assert.equal(r.data.total, 3);
  assert.deepEqual(r.data.rows.map(x => x.name), ["Beto", "Ana P.", "Caro"]);
  assert.equal(r.data.rows.find(x => x.me).name, "Ana P.");
  assert.ok(!JSON.stringify(r.data).includes("@"));

  // Números absurdos no entran.
  await call(progress, { method: "PUT", token: c, body: { state: { name: "Caro" }, base: undefined, force: true, rank: { ret: 999, days: 1 } } });
  r = await call(ranking);
  assert.equal(r.data.total, 2);

  // Salir del ranking.
  const g = await call(progress, { token: a });
  await call(progress, { method: "PUT", token: a, body: { state: { name: "Ana Pérez", rankOff: true }, base: g.data.savedAt, rank: null } });
  r = await call(ranking);
  assert.deepEqual(r.data.rows.map(x => x.name), ["Beto"]);
});

test("Google simulado: pide nombre la primera vez y contraseña siempre", async () => {
  resetMemoryStore();
  let r = await call(auth, { method: "POST", body: { action: "gdemo", email: "x@gmail.com", password: "12345678" } });
  assert.equal(r.status, 400); assert.equal(r.data.field, "name");
  r = await call(auth, { method: "POST", body: { action: "gdemo", email: "x@gmail.com", password: "12345678", name: "Xime" } });
  assert.equal(r.status, 200); assert.equal(r.data.isNew, true);
  r = await call(auth, { method: "POST", body: { action: "gdemo", email: "x@gmail.com", password: "otraotra1" } });
  assert.equal(r.status, 401); assert.equal(r.data.field, "pw");
  r = await call(auth, { method: "POST", body: { action: "gdemo", email: "x@gmail.com", password: "12345678" } });
  assert.equal(r.status, 200); assert.equal(r.data.user.name, "Xime");
});

test("borrar la cuenta borra progreso y ranking", async () => {
  resetMemoryStore();
  const s = await call(auth, { method: "POST", body: { action: "signup", name: "Dani", email: "dani@x.com", password: "12345678" } });
  await call(progress, { method: "PUT", token: s.data.token, body: { state: { name: "Dani" }, base: null, rank: { ret: 0.01, days: 1 } } });
  let r = await call(auth, { method: "POST", token: s.data.token, body: { action: "delete", password: "12345678" } });
  assert.equal(r.status, 200);
  r = await call(ranking); assert.equal(r.data.total, 0);
  r = await call(auth, { method: "POST", body: { action: "login", email: "dani@x.com", password: "12345678" } });
  assert.equal(r.status, 401);
});

test("muchos intentos de ingreso se frenan", async () => {
  resetMemoryStore();
  let last;
  for (let i = 0; i < 11; i++) last = await call(auth, { method: "POST", body: { action: "login", email: "nadie@x.com", password: "12345678" } });
  assert.equal(last.status, 429);
});

test("sin ANTHROPIC_API_KEY la IA responde que no está configurada", async () => {
  const r = await call(ask, { method: "POST", body: { messages: [{ role: "user", content: "hola" }] } });
  assert.equal(r.status, 501);
  assert.equal(r.data.code, "not_configured");
});

test("cotizaciones: Yahoo manda, BYMA de respaldo y para puntas", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async url => {
    url = String(url);
    const ok = v => ({ ok: true, status: 200, json: async () => v });
    if (url.includes("data912.com/live/arg_stocks")) return ok([{ symbol: "GGAL", c: 6000, px_bid: 5990, px_ask: 6010, pct_change: 1, v: 100 }, { symbol: "YPFD", c: 40000, px_bid: 39900, px_ask: 40100, pct_change: -1, v: 5 }]);
    if (url.includes("data912.com")) return ok([]);
    if (url.includes("GGAL.BA")) return ok({ chart: { result: [{ meta: { regularMarketPrice: 6050, chartPreviousClose: 5900, currency: "ARS", regularMarketVolume: 9, regularMarketTime: 1761300000 } }] } });
    if (url.includes("YPFD.BA")) return ok({ chart: { result: [{ meta: { regularMarketPrice: 400, chartPreviousClose: 390, currency: "ARS" } }] } });   // otra unidad: se descarta
    return { ok: false, status: 404, json: async () => ({}) };
  };
  try {
    const r = await call(quotesFn, { query: { s: "GGAL,YPFD,NADA" } });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.quotes.GGAL.c, 6050);
    assert.equal(r.data.quotes.GGAL.src, "yahoo");
    assert.equal(r.data.quotes.GGAL.pct, 2.54);
    assert.equal(r.data.quotes.GGAL.bid, 5990);
    assert.equal(r.data.quotes.YPFD.c, 40000);
    assert.equal(r.data.quotes.YPFD.src, "data912");
    assert.equal(r.data.quotes.NADA, undefined);
    assert.match(r.headers["cache-control"], /s-maxage=15/);
  } finally { globalThis.fetch = real; }
});
