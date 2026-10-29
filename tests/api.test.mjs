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
import { setMarketData, evaluate, START_CASH } from "../api/_lib/portfolio.js";

// Mercado de prueba: GGAL pasa de 1000 a 1100 y AL30 de 80000 a 80000.
const MD = { asOf: "2026-10-28", dates: ["2026-10-26", "2026-10-27", "2026-10-28"], series: { GGAL: [1000, 1050, 1100], AL30: [80000, 80000, 80000] } };
setMarketData(MD);
// Cartera como la arma la app: compra a mercado con costos (0,6% + derechos + IVA ≈ 0,8%).
function bkWith(buys) {
  const bk = { v: 2, cash: START_CASH, hold: {}, orders: [], start: "2026-10-26" };
  let id = 10231;
  for (const [t, qty, price, date] of buys) {
    const per = t === "AL30" ? 100 : 1, gross = qty * price / per, total = gross * 1.008;
    bk.cash -= total; bk.hold[t] = { qty: (bk.hold[t]?.qty || 0) + qty, cost: (bk.hold[t]?.cost || 0) + total };
    bk.orders.unshift({ id: id++, t, side: "buy", type: "mkt", qty, price, total, status: "Ejecutada", exec: { date, time: "12:00" } });
  }
  return bk;
}

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

  r = await call(progress, { method: "PUT", token: tk, body: { state: { name: "Agus Prueba", xp: 40, bk: bkWith([["GGAL", 100, 1000, "2026-10-26"]]) }, base: null, rank: { score: 70, tier: "Prudente" } } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const at1 = r.data.savedAt;

  // Otro dispositivo con una versión vieja no pisa lo nuevo.
  r = await call(progress, { method: "PUT", token: tk, body: { state: { xp: 1 }, base: null } });
  assert.equal(r.status, 409);
  assert.equal(r.data.state.xp, 40);

  r = await call(progress, { method: "PUT", token: tk, body: { state: { name: "Agus Prueba", xp: 55, bk: bkWith([["GGAL", 100, 1000, "2026-10-26"]]) }, base: at1, rank: { score: 72, tier: "Prudente" } } });
  assert.ok(r.data.rank, "entra al ranking");
  assert.equal(r.status, 200);

  r = await call(progress, { token: tk });
  assert.equal(r.data.state.xp, 55);
  assert.equal(r.data.user.name, "Agus Prueba");

  r = await call(progress, { token: "inventado" });
  assert.equal(r.status, 401);
});

test("ranking calculado por el servidor con precios reales, sin exponer emails", async () => {
  resetMemoryStore();
  const mk = async (name, email, buys, extra = {}) => {
    const r = await call(auth, { method: "POST", body: { action: "signup", name, email, password: "12345678" } });
    const bk = bkWith(buys); Object.assign(bk, extra);
    const p = await call(progress, { method: "PUT", token: r.data.token, body: { state: { name, bk }, base: null, rank: { score: 60, tier: "Prudente", ret: 9 } } });
    return { token: r.data.token, rank: p.data.rank };
  };
  const a = await mk("Ana Pérez", "ana@x.com", [["GGAL", 500, 1000, "2026-10-26"]]);       // ganó 10% sobre 500.000
  const b = await mk("Beto", "beto@x.com", [["GGAL", 900, 1000, "2026-10-26"]]);           // ganó 10% sobre 900.000
  const c = await mk("Caro", "caro@x.com", [["AL30", 100, 80000, "2026-10-26"]]);          // quedó igual
  // El "ret: 9" que manda la app se ignora: cuenta lo que calcula el servidor.
  assert.ok(Math.abs(b.rank.ret - (900 * 1100 + START_CASH - 900 * 1000 * 1.008) / START_CASH + 1) < 1e-4, JSON.stringify(b.rank));
  let r = await call(ranking, { token: a.token, headers: {} });
  assert.equal(r.data.total, 3);
  assert.deepEqual(r.data.rows.map(x => x.name), ["Beto", "Ana P.", "Caro"]);
  assert.equal(r.data.rows.find(x => x.me).name, "Ana P.");
  assert.equal(r.data.rows[0].days, 2);
  assert.ok(!JSON.stringify(r.data).includes("@"));

  // Una cartera trucha (más plata que la que salen de las órdenes) no entra.
  const d = await mk("Trucho", "trucho@x.com", [["GGAL", 10, 1000, "2026-10-26"]], { cash: 50_000_000 });
  assert.equal(d.rank, null);
  // Comprar a un precio que no existió tampoco.
  const e = await mk("Trucho2", "trucho2@x.com", [["GGAL", 10, 1, "2026-10-26"]]);
  assert.equal(e.rank, null);
  r = await call(ranking);
  assert.equal(r.data.total, 3);

  // Salir del ranking.
  const g = await call(progress, { token: c.token });
  await call(progress, { method: "PUT", token: c.token, body: { state: { ...g.data.state, rankOff: true }, base: g.data.savedAt, rank: null } });
  r = await call(ranking);
  assert.deepEqual(r.data.rows.map(x => x.name), ["Beto", "Ana P."]);

  // Llegan los cierres de un día nuevo: el ranking se recalcula solo, sin que nadie abra la app.
  setMarketData({ ...MD, asOf: "2026-10-29", dates: [...MD.dates, "2026-10-29"], series: { GGAL: [1000, 1050, 1100, 900], AL30: [80000, 80000, 80000, 80000] } });
  r = await call(ranking);
  assert.ok(r.data.rows.every(x => x.ret < 0), JSON.stringify(r.data.rows));
  assert.deepEqual(r.data.rows.map(x => x.name), ["Ana P.", "Beto"]);
  setMarketData(MD);
});

test("la cuenta del servidor cierra con ventas y órdenes pendientes", () => {
  const bk = bkWith([["GGAL", 100, 1000, "2026-10-26"]]);
  // venta de 40 a 1050
  const gross = 40 * 1050, total = gross * 0.992;
  bk.cash += total; bk.hold.GGAL.qty -= 40;
  bk.orders.unshift({ id: 20000, t: "GGAL", side: "sell", qty: 40, price: 1050, total, status: "Ejecutada", exec: { date: "2026-10-27" } });
  // compra limitada pendiente: reserva plata
  bk.cash -= 5000; bk.orders.unshift({ id: 20001, t: "GGAL", side: "buy", type: "lim", qty: 5, limit: 990, reserved: 5000, status: "Pendiente" });
  const ev = evaluate(bk, MD);
  assert.equal(ev.ok, true, ev.why);
  assert.ok(Math.abs(ev.value - (bk.cash + 5000 + 60 * 1100)) < 0.01);
  bk.hold.GGAL.qty += 1;
  assert.equal(evaluate(bk, MD).ok, false);
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
  await call(progress, { method: "PUT", token: s.data.token, body: { state: { name: "Dani", bk: bkWith([["GGAL", 1, 1000, "2026-10-26"]]) }, base: null } });
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
