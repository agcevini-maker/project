// Cuentas: crear, ingresar, Google, salir, recuperar la contraseña y borrar la cuenta.
// POST /api/auth  { action, ... }  →  { ok, token, user }
import crypto from "node:crypto";
import { db, getJSON, setJSON } from "./_lib/store.js";
import {
  handler, send, fail, readBody, normEmail, validEmail, cleanName, userKey, ip, limited,
  createSession, endSession, sessionUser, hashPassword, checkPassword
} from "./_lib/http.js";
import { removeRank } from "./_lib/rank.js";

const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || "";
const publicUser = (email, u) => ({ email, name: u.name, google: !!u.google, created: u.created });

async function opened(res, email, u, isNew) {
  const token = await createSession(email);
  const state = await getJSON("prog:" + email);
  return send(res, 200, { ok: true, token, user: publicUser(email, u), state: state?.data || null, savedAt: state?.at || null, isNew: !!isNew });
}

const actions = {
  async signup(b, req, res) {
    const email = normEmail(b.email), name = cleanName(b.name), pw = String(b.password || "");
    if (!name) return fail(res, 400, "Contanos cómo te llamás.");
    if (!validEmail(email)) return fail(res, 400, "Revisá el email: parece que tiene un error.");
    if (pw.length < 8 || pw.length > 200) return fail(res, 400, "La contraseña tiene que tener al menos 8 caracteres.");
    const u = { name, pw: hashPassword(pw), created: new Date().toISOString() };
    // nx: si dos pedidos llegan juntos, solo uno crea la cuenta.
    const ok = await db().set(userKey(email), JSON.stringify(u), { nx: true });
    if (!ok) {
      const old = await getJSON(userKey(email));
      return fail(res, 409, old && !old.pw ? "Esa cuenta se creó con Google. Tocá “Continuar con Google”." : "Ya hay una cuenta con ese email. Ingresá con tu contraseña.");
    }
    return opened(res, email, u, true);
  },

  async login(b, req, res) {
    const email = normEmail(b.email), pw = String(b.password || "");
    if (!validEmail(email)) return fail(res, 400, "Revisá el email.");
    if (await limited("login", email, 10, 900)) return fail(res, 429, "Probaste muchas veces. Esperá 15 minutos o recuperá tu contraseña.");
    const u = await getJSON(userKey(email));
    if (u && !u.pw) return fail(res, 401, "Esa cuenta se creó con Google. Tocá “Continuar con Google”.");
    if (!u || !checkPassword(pw, u.pw)) return fail(res, 401, "El email o la contraseña no coinciden.");
    return opened(res, email, u);
  },

  // Google simulado (cuando no hay GOOGLE_CLIENT_ID): Gmail + contraseña, y el nombre la primera vez.
  async gdemo(b, req, res) {
    if (GOOGLE_ID) return fail(res, 400, "Usá el botón de Google.");
    const email = normEmail(b.email), pw = String(b.password || ""), name = cleanName(b.name);
    if (!/^[^\s@]+@(gmail|googlemail)\.com$/.test(email)) return fail(res, 400, "Escribí tu Gmail (termina en @gmail.com).", { field: "email" });
    if (pw.length < 8 || pw.length > 200) return fail(res, 400, "La contraseña tiene que tener al menos 8 caracteres.", { field: "pw" });
    if (await limited("login", email, 10, 900)) return fail(res, 429, "Probaste muchas veces. Esperá 15 minutos.");
    const u = await getJSON(userKey(email));
    if (u) {
      if (!u.pw) { u.pw = hashPassword(pw); }
      else if (!checkPassword(pw, u.pw)) return fail(res, 401, "La contraseña no coincide. Si no te la acordás, volvé y tocá “¿Te olvidaste la contraseña?”.", { field: "pw" });
      u.google = true; await setJSON(userKey(email), u);
      return opened(res, email, u);
    }
    if (!name) return fail(res, 400, "Es tu primera vez: contanos cómo te llamás.", { field: "name" });
    const nu = { name, pw: hashPassword(pw), google: true, created: new Date().toISOString() };
    if (!await db().set(userKey(email), JSON.stringify(nu), { nx: true })) return fail(res, 409, "Probá de nuevo.");
    return opened(res, email, nu, true);
  },

  // Google real: la app manda el access token de Google y acá se verifica con Google.
  async google(b, req, res) {
    if (!GOOGLE_ID) return fail(res, 400, "El ingreso con Google no está configurado.");
    const at = String(b.accessToken || "");
    if (!at || at.length > 4096) return fail(res, 400, "Falta el permiso de Google.");
    const info = await fetch("https://oauth2.googleapis.com/tokeninfo?access_token=" + encodeURIComponent(at)).then(r => r.ok ? r.json() : null).catch(() => null);
    if (!info || (info.aud !== GOOGLE_ID && info.azp !== GOOGLE_ID)) return fail(res, 401, "No se pudo verificar tu cuenta de Google.");
    if (!info.email || String(info.email_verified) !== "true") return fail(res, 401, "Tu cuenta de Google no tiene un email verificado.");
    const email = normEmail(info.email);
    let u = await getJSON(userKey(email)), isNew = false;
    if (!u) {
      const prof = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: "Bearer " + at } }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
      u = { name: cleanName(prof.given_name || prof.name || email.split("@")[0]), google: true, created: new Date().toISOString() };
      isNew = true;
    } else u.google = true;
    await setJSON(userKey(email), u);
    return opened(res, email, u, isNew);
  },

  async logout(b, req, res) {
    const s = await sessionUser(req);
    if (s) await endSession(s.token);
    return send(res, 200, { ok: true });
  },

  // Pide un link para crear una contraseña nueva. Responde lo mismo exista o no la cuenta.
  async resetRequest(b, req, res) {
    const email = normEmail(b.email);
    if (!validEmail(email)) return fail(res, 400, "Revisá el email: parece que tiene un error.");
    if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) return fail(res, 501, "La recuperación por email todavía no está activada. Pedile ayuda a quien administra la app.");
    if (await limited("reset", email, 3, 3600) || await limited("reset-ip", ip(req), 10, 3600)) return fail(res, 429, "Ya pediste varios links. Revisá tu correo (también el no deseado) o esperá una hora.");
    const u = await getJSON(userKey(email));
    if (u) {
      const t = crypto.randomBytes(24).toString("base64url");
      await db().set("reset:" + crypto.createHash("sha256").update(t).digest("hex"), email, { ex: 1800 });
      const base = String(b.returnTo || "").match(/^https?:\/\/[^\s"<>]+$/) ? b.returnTo.split("#")[0].split("?")[0] : `https://${req.headers.host}/`;
      const link = `${base}?reset=${t}`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.MAIL_FROM, to: [email], subject: "Creá una contraseña nueva para Sin Miedo",
          html: `<p>Hola ${u.name.replace(/[<>&]/g, "")}:</p><p>Para crear una contraseña nueva tocá este link (vence en 30 minutos):</p><p><a href="${link}">${link}</a></p><p>Si no lo pediste, ignorá este correo: tu contraseña sigue igual.</p>`
        })
      }).catch(() => null);
      if (!r || !r.ok) return fail(res, 502, "No pudimos mandar el email. Probá de nuevo en un rato.");
    }
    return send(res, 200, { ok: true, message: "Si hay una cuenta con ese email, te llega un link para crear una contraseña nueva. Revisá también el correo no deseado." });
  },

  async reset(b, req, res) {
    const t = String(b.token || ""), pw = String(b.password || "");
    if (pw.length < 8 || pw.length > 200) return fail(res, 400, "La contraseña tiene que tener al menos 8 caracteres.");
    const k = "reset:" + crypto.createHash("sha256").update(t).digest("hex");
    const email = t && await db().get(k);
    if (!email) return fail(res, 400, "El link venció o ya se usó. Pedí uno nuevo.");
    await db().del(k);
    const u = await getJSON(userKey(email));
    if (!u) return fail(res, 400, "La cuenta ya no existe.");
    u.pw = hashPassword(pw); await setJSON(userKey(email), u);
    return opened(res, email, u);
  },

  // Borra la cuenta, el progreso y el lugar en el ranking.
  async delete(b, req, res) {
    const s = await sessionUser(req);
    if (!s) return fail(res, 401, "Tu sesión venció. Volvé a ingresar.");
    if (s.user.pw && !checkPassword(String(b.password || ""), s.user.pw)) return fail(res, 401, "La contraseña no coincide.");
    await Promise.all([db().del(userKey(s.email)), db().del("prog:" + s.email), removeRank(s.email), endSession(s.token)]);
    return send(res, 200, { ok: true });
  }
};

export default handler(["POST"], async (req, res) => {
  const b = await readBody(req, 20_000);
  const fn = actions[b?.action];
  if (!fn) return fail(res, 400, "Acción desconocida.");
  if (await limited("auth-ip", ip(req), 60, 600)) return fail(res, 429, "Demasiados intentos seguidos. Esperá unos minutos.");
  return fn(b, req, res);
});
