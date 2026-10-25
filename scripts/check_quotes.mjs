// Consulta las cotizaciones reales con la misma función que usa Vercel (api/quotes.js) y muestra una tabla.
// Uso: node scripts/check_quotes.mjs   (necesita internet)
import { quotes, yahooQuote } from "../api/quotes.js";

const list = ["GGAL", "YPFD", "PAMP", "ALUA", "AAPL", "KO", "MELI", "SPY", "AL30", "GD30"];
const raw = await Promise.all(list.map(yahooQuote));
const { quotes: q, src } = await quotes(list);
console.log("ticker  yahoo(.BA)        usado      fuente   var%    compra    venta");
list.forEach((t, i) => {
  const y = raw[i], r = q[t];
  console.log(t.padEnd(7), String(y ? `${y.c} ${y.cur}` : "-").padEnd(17), String(r?.c ?? "-").padEnd(10), String(r?.src ?? "-").padEnd(8), String(r?.pct ?? "-").padEnd(7), String(r?.bid || "-").padEnd(9), r?.ask || "-");
});
console.log("fuentes:", JSON.stringify(src));
if (!src.yahoo) { console.log("Yahoo no respondió para ningún ticker."); process.exitCode = 1; }

// Diagnóstico: qué contesta Yahoo directamente.
for (const url of [
  "https://query1.finance.yahoo.com/v8/finance/chart/GGAL.BA?range=1d&interval=5m",
  "https://query2.finance.yahoo.com/v8/finance/chart/GGAL.BA?range=1d&interval=1d",
  "https://query1.finance.yahoo.com/v8/finance/chart/GGAL.BA?range=5d&interval=1d"
]) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", Accept: "application/json" } });
    const t = await r.text();
    console.log("diag", r.status, url.split("/chart/")[1], t.slice(0, 300).replace(/\s+/g, " "));
  } catch (e) { console.log("diag error", url, e.message); }
}
