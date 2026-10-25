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
