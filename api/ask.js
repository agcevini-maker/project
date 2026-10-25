// Asistente con IA (Claude) para "Preguntá": POST /api/ask { messages: [{ role, content }] }
// Responde por partes (una línea JSON por evento) para que el texto aparezca mientras se escribe:
//   {"t":"delta","text":"..."}  ...  {"t":"end","truncated":false}   o   {"t":"error","code":"..."}
// Necesita la variable ANTHROPIC_API_KEY. Sin ella, la app usa sus respuestas guardadas.
import Anthropic from "@anthropic-ai/sdk";
import { handler, fail, readBody, sessionUser, ip, limited, cors } from "./_lib/http.js";
import { db } from "./_lib/store.js";
import { AI_RULES } from "./_lib/rules.js";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
export const AI_MODEL = process.env.AI_MODEL || "claude-opus-5-5";

function cleanTurns(list) {
  if (!Array.isArray(list)) return null;
  const turns = list.slice(-12).map(m => ({ role: m?.role === "assistant" ? "assistant" : "user", content: String(m?.content || "").slice(0, 2000).trim() })).filter(m => m.content);
  // La conversación tiene que empezar por la persona y alternar.
  const out = [];
  turns.forEach(m => { if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += "\n\n" + m.content; else out.push(m); });
  while (out.length && out[0].role !== "user") out.shift();
  return out.length && out[out.length - 1].role === "user" ? out : null;
}

export default handler(["POST"], async (req, res) => {
  if (!client) return fail(res, 501, "La IA no está configurada en este servidor.", { code: "not_configured" });
  const s = await sessionUser(req);
  // Con base de datos real hace falta una cuenta; así nadie usa la clave de la API sin entrar a la app.
  if (!s && (db().kind === "redis" || process.env.MEMORY_ACCOUNTS === "1")) return fail(res, 401, "Tu sesión venció. Volvé a ingresar.", { code: "session_expired" });
  const who = s ? "u:" + s.email : "ip:" + ip(req);
  if (await limited("ask", who, 15, 600) || await limited("ask-day", who, 120, 86400)) return fail(res, 429, "Hiciste muchas preguntas seguidas.", { code: "rate_limited" });
  const b = await readBody(req, 40_000);
  const messages = cleanTurns(b.messages);
  if (!messages) return fail(res, 400, "Falta la pregunta.");

  cors(res);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");
  const out = o => res.write(JSON.stringify(o) + "\n");

  const stream = client.beta.messages.stream({
    model: AI_MODEL,
    max_tokens: 2000,
    system: AI_RULES,
    output_config: { effort: "low" },
    // Si el modelo declina por una regla de seguridad, la API reintenta sola con otro modelo.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages
  });
  req.on("close", () => { if (!res.writableEnded) stream.abort(); });
  stream.on("text", text => out({ t: "delta", text }));
  try {
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") out({ t: "error", code: "refused" });
    else out({ t: "end", truncated: msg.stop_reason === "max_tokens" });
  } catch (e) {
    const st = e?.status;
    out({ t: "error", code: st === 429 ? "rate_limited" : st === 400 && /too long/i.test(e?.message || "") ? "prompt_too_large" : "unavailable" });
    if (!(e instanceof Anthropic.APIUserAbortError)) console.error("ask:", st, e?.message);
  }
  res.end();
});
