// Rendimiento de la cartera de práctica calculado en el servidor, con los cierres reales del día
// (public/data/mercado.json, el mismo archivo que usa la app y que GitHub Actions actualiza cada día hábil).
// Así el ranking no depende de lo que mande el navegador: se rehace la cuenta con las órdenes guardadas y,
// si no cierran (saldo o tenencias que no salen de las órdenes, o precios lejos de los reales), la cuenta no entra.
export const START_CASH = 1_000_000;
const PER = { AL30: 100, GD30: 100, LECAP: 100 };

let mcache = null;
// Datos de mercado: se leen del mismo sitio (la carpeta public/ publicada) y se guardan 10 minutos.
// Si el sitio no responde (por ejemplo, con la protección de Vercel activa), se usa la copia que viaja con la función.
export async function marketData(host) {
  if (mcache && Date.now() - mcache.at < 600_000) return mcache.md;
  let j = null;
  try {
    const proto = /^(localhost|127\.)/.test(host || "") ? "http" : "https";
    const r = await fetch(`${proto}://${host}/data/mercado.json`, { signal: AbortSignal.timeout(8000) });
    if (r.ok) j = await r.json();
  } catch (e) { j = null; }
  if (!j?.dates || !j?.series) {
    const fs = await import("node:fs/promises"), path = await import("node:path");
    j = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "mercado.json"), "utf8"));
  }
  if (!j?.dates || !j?.series) throw new Error("mercado.json sin datos");
  mcache = { at: Date.now(), md: j };
  return j;
}
export function setMarketData(md) { mcache = md ? { at: Date.now(), md } : null; }

const lastClose = (md, t) => { const s = md.series[t]; if (!s) return null; for (let k = s.length - 1; k >= 0; k--) if (s[k] > 0) return s[k]; return null; };
function closeOn(md, t, date) {
  const s = md.series[t]; if (!s) return null;
  let i = md.dates.findIndex(d => d >= date); if (i < 0) i = md.dates.length - 1;
  for (let k = i; k >= 0; k--) if (s[k] > 0) return s[k];
  return null;
}
const num = v => typeof v === "number" && Number.isFinite(v);

// Devuelve { ok, ret, days, value, why }.
export function evaluate(bk, md) {
  if (!bk || typeof bk !== "object" || !Array.isArray(bk.orders) || !bk.hold || !num(bk.cash)) return { ok: false, why: "sin cartera" };
  const orders = bk.orders.filter(o => o && typeof o === "object").slice().sort((a, b) => (a.id || 0) - (b.id || 0));
  let cash = START_CASH, reserved = 0, bought = 0;
  const hold = {};
  for (const o of orders) {
    const t = String(o.t || ""), qty = +o.qty, per = PER[t] || 1;
    if (o.status === "Pendiente" && o.side === "buy") { if (!(+o.reserved >= 0)) return { ok: false, why: "reserva inválida" }; reserved += +o.reserved; continue; }
    if (o.status !== "Ejecutada") continue;
    if (!(qty > 0) || !(+o.price > 0) || !num(+o.total)) return { ok: false, why: "orden inválida " + o.id };
    const gross = qty * o.price / per;
    // Los costos (comisión, derechos e IVA) son menos del 2% de la operación.
    const okTotal = o.side === "buy" ? o.total >= gross * 0.999 && o.total <= gross * 1.02 + 1 : o.total <= gross * 1.001 + 1 && o.total >= gross * 0.98 - 1;
    if (!okTotal) return { ok: false, why: "importe que no cierra " + o.id };
    // El precio tiene que estar cerca del cierre real de ese día (en vivo puede moverse durante la rueda).
    const ref = closeOn(md, t, o.exec?.date || o.created?.date || md.asOf);
    if (ref && Math.abs(o.price / ref - 1) > 0.25) return { ok: false, why: "precio lejos del real " + o.id };
    if (o.side === "buy") { cash -= o.total; hold[t] = (hold[t] || 0) + qty; bought++; }
    else if (o.side === "sell") { cash += o.total; hold[t] = (hold[t] || 0) - qty; if (hold[t] < -1e-6) return { ok: false, why: "venta sin tenencia " + o.id }; }
  }
  if (!bought) return { ok: false, why: "sin compras" };
  if (Math.abs(cash - reserved - bk.cash) > 1 + Math.abs(bk.cash) * 1e-9) return { ok: false, why: "saldo que no sale de las órdenes" };
  const keys = new Set([...Object.keys(hold).filter(k => hold[k] > 1e-9), ...Object.keys(bk.hold)]);
  for (const k of keys) if (Math.abs((hold[k] || 0) - (+bk.hold[k]?.qty || 0)) > 1e-6 * Math.max(1, hold[k] || 0)) return { ok: false, why: "tenencia que no sale de las órdenes " + k };
  let value = bk.cash + reserved;
  for (const [k, q] of Object.entries(hold)) {
    if (!(q > 1e-9)) continue;
    const px = lastClose(md, k);
    value += px ? q * px / (PER[k] || 1) : (+bk.hold[k]?.cost || 0);   // sin precio (una Lecap vencida): a lo que costó
  }
  const startI = md.dates.findIndex(d => d >= (bk.start || md.asOf));
  const days = startI < 0 ? 0 : md.dates.length - 1 - startI;
  return { ok: true, ret: value / START_CASH - 1, days, value: Math.round(value * 100) / 100, asOf: md.asOf };
}
