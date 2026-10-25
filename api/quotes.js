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
  const [yh, bym] = await Promise.all([Promise.all(list.map(yahooQuote)), data912()]);
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
    const bid = +d?.px_bid || 0, ask = +d?.px_ask || 0;
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
