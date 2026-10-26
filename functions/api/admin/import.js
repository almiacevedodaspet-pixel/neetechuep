import { isAuthed, getContent, json } from '../../_lib/auth.js';
import { FIELDS, clean } from '../../_lib/schema.js';
export async function onRequestPost({ request, env }) {
  if (!(await isAuthed(request, env))) return json({ error: 'No autorizado' }, 401);
  if (!env.NEETECH_KV) return json({ error: 'Falta el binding KV NEETECH_KV en Cloudflare Pages.' }, 500);
  let b; try { b = await request.json(); } catch { return json({ error: 'Solicitud inválida' }, 400); }
  const c = await getContent(env, request), added = {}, errors = [];
  let skipped = 0;
  for (const type of Object.keys(FIELDS)) {
    if (!Array.isArray(b[type])) continue;
    const base = b.replace ? [] : (c[type] || []);
    const seen = new Set(base.map(x => (x.title + '|' + x.author).toLowerCase()));
    const fresh = [];
    b[type].slice(0, 500).forEach((r, i) => {
      try {
        const o = clean(type, r), k = (o.title + '|' + o.author).toLowerCase();
        if (seen.has(k)) { skipped++; return; }
        seen.add(k); fresh.push({ id: crypto.randomUUID(), ...o });
      } catch (e) { errors.push(type + ' fila ' + (i + 2) + ': ' + e.message); }
    });
    c[type] = [...fresh, ...base]; added[type] = fresh.length;
  }
  await env.NEETECH_KV.put('content', JSON.stringify(c));
  return json({ ok: true, added, skipped, errors: errors.slice(0, 20) });
}
