// Progreso de cada cuenta (la cartera de práctica, las lecciones, la racha, el chat).
// GET  /api/progress                    →  { ok, user, state, savedAt }
// PUT  /api/progress { state, base, rank } →  { ok, savedAt }   (409 si otro dispositivo guardó algo más nuevo)
import { getJSON, setJSON } from "./_lib/store.js";
import { handler, send, fail, readBody, sessionUser } from "./_lib/http.js";
import { cleanEntry, setRank } from "./_lib/rank.js";

const LIMIT = 400_000;
const rankName = name => { const n = String(name || "").trim().split(/\s+/); return (n[0] || "Inversor").slice(0, 20) + (n[1] ? " " + n[1][0].toUpperCase() + "." : ""); };

export default handler(["GET", "PUT"], async (req, res) => {
  const s = await sessionUser(req);
  if (!s) return fail(res, 401, "Tu sesión venció. Volvé a ingresar.");
  const key = "prog:" + s.email;
  const cur = await getJSON(key);
  const user = { email: s.email, name: s.user.name, google: !!s.user.google };
  if (req.method === "GET") return send(res, 200, { ok: true, user, state: cur?.data || null, savedAt: cur?.at || null });

  const b = await readBody(req, LIMIT + 10_000);
  if (!b || typeof b.state !== "object" || Array.isArray(b.state) || b.state === null) return fail(res, 400, "Falta el progreso.");
  if (JSON.stringify(b.state).length > LIMIT) return fail(res, 413, "El progreso es demasiado grande para guardarlo.");
  if (cur && b.base !== undefined && b.base !== cur.at && !b.force) return send(res, 409, { ok: false, error: "Hay progreso más nuevo guardado desde otro dispositivo.", state: cur.data, savedAt: cur.at });
  const at = new Date().toISOString();
  await setJSON(key, { data: b.state, at });
  if ("rank" in b) await setRank(s.email, b.state.rankOff ? null : cleanEntry(b.rank, rankName(b.state.name || s.user.name)));
  return send(res, 200, { ok: true, savedAt: at });
});
