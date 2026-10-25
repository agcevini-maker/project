// Cotizaciones reales: GET /api/quotes?s=GGAL,YPFD,AL30,...
// Último precio y variación del día de Yahoo Finance (tickers de BYMA con ".BA").
// Las puntas de compra y venta (y el respaldo si Yahoo no responde) salen de data912.com, que publica BYMA.
// Vercel guarda la respuesta 15 segundos en su CDN, así que todos los usuarios comparten una sola consulta.
import { handler, send, fail } from "./_lib/http.js";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const D912 = ["arg_stocks", "arg_cedears", "arg_bonds", "arg_notes"];
const cache = new Map();   // dura mientras la función siga "caliente"

async function getJSON(url, ms = 6000) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < 15_000) return hit.v;
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(url + " → " + r.status);
  const v = await r.json();
  cache.set(url, { at: Date.now(), v });
  return v;
}

// Yahoo rechaza (429) los pedidos anónimos desde servidores en la nube. Como hace la librería yfinance,
// primero se pide una cookie (fc.yahoo.com) y un "crumb", y con eso se consultan todos los tickers juntos.
let ysess = null;
async function yahooSession(force) {
  if (ysess && !force && Date.now() - ysess.at < 30 * 60_000) return ysess;
  const r1 = await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": UA }, redirect: "manual", signal: AbortSignal.timeout(6000) }).catch(() => null);
  const raw = r1?.headers?.getSetCookie ? r1.headers.getSetCookie() : [r1?.headers?.get("set-cookie") || ""];
  const cookie = raw.map(c => String(c).split(";")[0]).filter(c => c.includes("=")).join("; ");
  if (!cookie) throw new Error("Yahoo no dio cookie");
  const r2 = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", { headers: { "User-Agent": UA, Cookie: cookie }, signal: AbortSignal.timeout(6000) });
  const crumb = (await r2.text()).trim();
  if (!r2.ok || !crumb || crumb.length > 40 || /[<{\s]/.test(crumb)) throw new Error("Yahoo no dio crumb (" + r2.status + ")");
  ysess = { cookie, crumb, at: Date.now() };
  return ysess;
}

export async function yahooQuotes(list) {
  const key = "yq:" + list.join(",");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 15_000) return hit.v;
  for (const retry of [false, true]) {
    try {
      const { cookie, crumb } = await yahooSession(retry);
      const syms = list.map(t => t + ".BA").join(",");
      const r = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(syms)}&crumb=${encodeURIComponent(crumb)}`, { headers: { "User-Agent": UA, Cookie: cookie, Accept: "application/json" }, signal: AbortSignal.timeout(6000) });
      if (r.status === 401 || r.status === 403 || r.status === 429) { ysess = null; continue; }
      if (!r.ok) throw new Error("Yahoo " + r.status);
      const j = await r.json(), out = {};
      (j?.quoteResponse?.result || []).forEach(x => {
        const t = String(x.symbol || "").replace(/\.BA$/, ""), c = +x.regularMarketPrice;
        if (!(c > 0)) return;
        const prev = +x.regularMarketPreviousClose;
        out[t] = { c, prev: prev > 0 ? prev : null, v: +x.regularMarketVolume || 0, bid: +x.bid || 0, ask: +x.ask || 0, time: x.regularMarketTime ? new Date((typeof x.regularMarketTime === "number" ? x.regularMarketTime * 1000 : x.regularMarketTime)).toISOString() : null, cur: x.currency || "ARS" };
      });
      cache.set(key, { at: Date.now(), v: out });
      return out;
    } catch (e) { if (retry) console.error("yahoo:", e.message); ysess = null; }
  }
  return {};
}

// Respaldo: el gráfico de un ticker (a veces Yahoo lo deja leer sin sesión).
export async function yahooQuote(sym) {
  for (const host of ["query1", "query2"]) {
    try {
      const j = await getJSON(`https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym + ".BA")}?range=1d&interval=5m&includePrePost=false`);
      const m = j?.chart?.result?.[0]?.meta;
      const c = +m?.regularMarketPrice, prev = +(m?.chartPreviousClose ?? m?.previousClose);
      if (c > 0) return { c, prev: prev > 0 ? prev : null, v: +m.regularMarketVolume || 0, time: m.regularMarketTime ? new Date(m.regularMarketTime * 1000).toISOString() : null, cur: m.currency || "ARS" };
    } catch (e) { /* se prueba el otro servidor de Yahoo */ }
  }
  return null;
}

async function data912() {
  const files = await Promise.all(D912.map(f => getJSON("https://data912.com/live/" + f).catch(() => [])));
  const out = {};
  files.flat().forEach(r => { if (r && r.symbol) out[r.symbol] = r; });
  return out;
}

export async function quotes(list) {
  const [yq, bym] = await Promise.all([yahooQuotes(list), data912()]);
  const missing = list.filter(t => !yq[t]);
  const extra = missing.length && missing.length <= 5 ? await Promise.all(missing.map(yahooQuote)) : [];
  missing.forEach((t, i) => { if (extra[i]) yq[t] = extra[i]; });
  const yh = list.map(t => yq[t] || null);
  const q = {}, src = { yahoo: 0, data912: 0 };
  list.forEach((t, i) => {
    const y = yh[i], d = bym[t];
    const dc = +d?.c > 0 ? +d.c : null;
    let row = null;
    // Yahoo manda; si su precio está muy lejos del de BYMA (otra unidad o un dato viejo), se usa BYMA.
    if (y && (y.cur === "ARS") && (!dc || Math.abs(y.c / dc - 1) < 0.15)) {
      const pct = y.prev ? (y.c / y.prev - 1) * 100 : +d?.pct_change || 0;
      row = { c: y.c, pct: Math.round(pct * 100) / 100, v: +d?.v || y.v, src: "yahoo", time: y.time };
      src.yahoo++;
    } else if (dc) {
      row = { c: dc, pct: +d.pct_change || 0, v: +d.v || 0, src: "data912", time: null };
      src.data912++;
    }
    if (!row) return;
    // Puntas de BYMA solo si tienen sentido con el último precio.
    const bid = +d?.px_bid || (row.src === "yahoo" ? y.bid : 0) || 0, ask = +d?.px_ask || (row.src === "yahoo" ? y.ask : 0) || 0;
    row.bid = bid > 0 && bid <= row.c * 1.02 && bid >= row.c * 0.9 ? bid : 0;
    row.ask = ask > 0 && ask >= row.c * 0.98 && ask <= row.c * 1.1 ? ask : 0;
    if (row.bid && row.ask && row.bid > row.ask) row.bid = row.ask = 0;
    q[t] = row;
  });
  return { quotes: q, src };
}

export default handler(["GET"], async (req, res) => {
  const raw = String((req.query && req.query.s) || new URL(req.url, "http://x").searchParams.get("s") || "");
  const list = [...new Set(raw.toUpperCase().split(",").map(x => x.trim()).filter(x => /^[A-Z0-9]{1,10}$/.test(x)))].slice(0, 25);
  if (!list.length) return fail(res, 400, "Indicá los tickers, por ejemplo ?s=GGAL,YPFD");
  const { quotes: q, src } = await quotes(list);
  if (!Object.keys(q).length) return fail(res, 502, "No se pudieron leer las cotizaciones. Se reintenta solo.");
  return send(res, 200, { ok: true, at: new Date().toISOString(), src, quotes: q }, { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45" });
});
