import { makeToken, safeEqual, isAuthed, json } from '../_lib/auth.js';
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_USER || !env.ADMIN_PASS || !env.SESSION_SECRET)
    return json({ error: 'Faltan las variables ADMIN_USER, ADMIN_PASS y SESSION_SECRET en Cloudflare.' }, 500);
  let b; try { b = await request.json(); } catch { return json({ error: 'Solicitud inválida' }, 400); }
  const ok = safeEqual(b.user || '', env.ADMIN_USER) && safeEqual(b.pass || '', env.ADMIN_PASS);
  if (!ok) return json({ error: 'Usuario o contraseña incorrectos' }, 401);
  const t = await makeToken(env);
  return json({ ok: true }, 200, { 'Set-Cookie': `nt_session=${t}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` });
}
export async function onRequestGet({ request, env }) {
  return json({ authed: await isAuthed(request, env) });
}
export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': 'nt_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
}
