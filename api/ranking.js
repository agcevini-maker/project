// Ranking real entre todas las cuentas: GET /api/ranking  →  { ok, rows, mine, total }
// Con sesión marca tu fila ("me") y, si no estás entre los primeros, devuelve tu puesto en "mine".
import { handler, send, sessionUser } from "./_lib/http.js";
import { topRanking } from "./_lib/rank.js";

export default handler(["GET"], async (req, res) => {
  const s = await sessionUser(req);
  const out = await topRanking(100, s?.email);
  return send(res, 200, { ok: true, ...out });
});
