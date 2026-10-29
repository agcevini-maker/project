// Qué está activo en este servidor. La app lo consulta al abrir para decidir dónde guardar y de dónde sacar precios.
// También sirve para revisar la instalación: abrí /api/health en el navegador.
import { handler, send } from "./_lib/http.js";
import { db } from "./_lib/store.js";
import { marketData } from "./_lib/portfolio.js";

const env = process.env;
const dbVars = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL ? "upstash" : env.REDIS_URL || env.KV_URL ? "redis" : "ninguna";

export default handler(["GET"], async (req, res) => {
  let dbOk = false, dbError = "";
  try {
    const k = "health:" + Math.random().toString(36).slice(2);
    await db().set(k, "1", { ex: 60 });
    dbOk = (await db().get(k)) === "1";
    if (!dbOk) dbError = "La base respondió, pero no devolvió lo guardado.";
  } catch (e) { dbError = "No se pudo conectar con la base de datos: " + String(e?.message || e).slice(0, 160); }
  const memory = db().kind === "memory", accounts = dbOk && (!memory || env.MEMORY_ACCOUNTS === "1");
  let market = null;
  try { market = (await marketData(req.headers.host)).asOf; } catch (e) { market = null; }
  return send(res, 200, {
    ok: true,
    db: dbOk ? db().kind : "error",               // "redis" = base real; "memory" = memoria temporal
    accounts,                                     // cuentas, progreso y ranking en el servidor
    ai: !!env.ANTHROPIC_API_KEY,
    google: env.GOOGLE_CLIENT_ID || "",           // ID público de OAuth: hace falta en el navegador
    mail: !!(env.RESEND_API_KEY && env.MAIL_FROM),
    quotes: true,
    market,                                       // fecha de los últimos cierres que usa el ranking
    ...(accounts ? {} : {
      fix: dbError || (memory
        ? "Falta conectar una base de datos: en Vercel, Storage → Create Database → Upstash (Redis) → Connect, y después Redeploy. Sin eso el progreso queda solo en cada dispositivo y no hay ranking compartido."
        : "La base de datos no responde.")
    }),
    dbVars
  }, { "Cache-Control": "no-store" });
});
