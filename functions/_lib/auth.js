const enc = new TextEncoder();
async function sign(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function safeEqual(a, b) {
  const x = enc.encode(String(a)), y = enc.encode(String(b));
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}
export async function makeToken(env) {
  const exp = Date.now() + 8 * 3600 * 1000;
  return `${exp}.${await sign(env.SESSION_SECRET, String(exp))}`;
}
export async function isAuthed(request, env) {
  if (!env.SESSION_SECRET) return false;
  const m = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)nt_session=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await sign(env.SESSION_SECRET, exp));
}
export const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
export async function getContent(env, request) {
  if (env.NEETECH_KV) {
    const c = await env.NEETECH_KV.get('content', 'json');
    if (c) return c;
  }
  const r = await env.ASSETS.fetch(new URL('/data/seed.json', request.url));
  return await r.json();
}
