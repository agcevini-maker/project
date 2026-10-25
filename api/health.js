// Qué está activo en este servidor. La app lo consulta al abrir para decidir dónde guardar y de dónde sacar precios.
import { handler, send } from "./_lib/http.js";
import { db } from "./_lib/store.js";

export default handler(["GET"], async (req, res) => {
  let dbOk = false;
  try { await db().get("health"); dbOk = true; } catch (e) { dbOk = false; }
  return send(res, 200, {
    ok: true,
    db: dbOk ? db().kind : "error",               // "redis" = base real; "memory" = memoria temporal
    accounts: dbOk && (db().kind === "redis" || process.env.MEMORY_ACCOUNTS === "1"),   // cuentas en el servidor
    ai: !!process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_CLIENT_ID || "",   // ID público de OAuth: hace falta en el navegador
    mail: !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM),
    quotes: true
  }, { "Cache-Control": "no-store" });
});
