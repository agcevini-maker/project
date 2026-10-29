// Ranking real entre todas las cuentas: GET /api/ranking  →  { ok, rows, mine, total, asOf }
// El rendimiento lo calcula el servidor con los cierres reales del día (ver _lib/portfolio.js).
// Con sesión marca tu fila ("me") y, si no estás entre los primeros, devuelve tu puesto en "mine".
import { handler, send, sessionUser } from "./_lib/http.js";
import { topRanking } from "./_lib/rank.js";
import { marketData } from "./_lib/portfolio.js";

export default handler(["GET"], async (req, res) => {
  const s = await sessionUser(req);
  const md = await marketData(req.headers.host).catch(e => { console.error("ranking:", e.message); return null; });
  const out = await topRanking(100, s?.email, md);
  return send(res, 200, { ok: true, ...out });
});
