// Consulta las cotizaciones reales con la misma función que usa Vercel (api/quotes.js) y muestra una tabla.
// Uso: node scripts/check_quotes.mjs   (necesita internet)
import { quotes, yahooQuotes } from "../api/quotes.js";

const list = ["GGAL", "YPFD", "PAMP", "ALUA", "AAPL", "KO", "MELI", "SPY", "AL30", "GD30"];
const yq = await yahooQuotes(list), raw = list.map(t => yq[t]);
const { quotes: q, src } = await quotes(list);
console.log("ticker  yahoo(.BA)        usado      fuente   var%    compra    venta");
list.forEach((t, i) => {
  const y = raw[i], r = q[t];
  console.log(t.padEnd(7), String(y ? `${y.c} ${y.cur}` : "-").padEnd(17), String(r?.c ?? "-").padEnd(10), String(r?.src ?? "-").padEnd(8), String(r?.pct ?? "-").padEnd(7), String(r?.bid || "-").padEnd(9), r?.ask || "-");
});
console.log("fuentes:", JSON.stringify(src));
if (!src.yahoo) { console.log("Yahoo no respondió para ningún ticker."); process.exitCode = 1; }

// Diagnóstico de la sesión de Yahoo (cookie + crumb).
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
try {
  const r1 = await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": UA }, redirect: "manual" });
  const ck = r1.headers.getSetCookie().map(c => c.split(";")[0]);
  console.log("diag cookie:", r1.status, ck.map(c => c.split("=")[0]).join(","));
  const r2 = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", { headers: { "User-Agent": UA, Cookie: ck.join("; ") } });
  console.log("diag crumb:", r2.status, (await r2.text()).slice(0, 60).length, "caracteres");
} catch (e) { console.log("diag error:", e.message); }
