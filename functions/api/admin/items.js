import { isAuthed, getContent, json } from '../../_lib/auth.js';
import { FIELDS, clean } from '../../_lib/schema.js';
const chk = (t) => { if (!FIELDS[t]) throw new Error('Tipo inválido'); };
async function run(ctx, fn) {
  if (!(await isAuthed(ctx.request, ctx.env))) return json({ error: 'No autorizado' }, 401);
  if (!ctx.env.NEETECH_KV) return json({ error: 'Falta el binding KV NEETECH_KV en Cloudflare Pages.' }, 500);
  try {
    const content = await getContent(ctx.env, ctx.request);
    const out = await fn(content);
    await ctx.env.NEETECH_KV.put('content', JSON.stringify(content));
    return json({ ok: true, ...out });
  } catch (e) { return json({ error: e.message }, 400); }
}
export const onRequestPost = (ctx) => run(ctx, async (c) => {
  const b = await ctx.request.json(); chk(b.type);
  const item = { id: crypto.randomUUID(), ...clean(b.type, b.data || {}) };
  c[b.type] = [item, ...(c[b.type] || [])]; return { item };
});
export const onRequestPut = (ctx) => run(ctx, async (c) => {
  const b = await ctx.request.json(); chk(b.type);
  const i = (c[b.type] || []).findIndex(x => x.id === b.id);
  if (i < 0) throw new Error('No encontrado');
  c[b.type][i] = { id: b.id, ...clean(b.type, b.data || {}) }; return {};
});
export const onRequestDelete = (ctx) => run(ctx, async (c) => {
  const u = new URL(ctx.request.url), t = u.searchParams.get('type'), id = u.searchParams.get('id'); chk(t);
  c[t] = (c[t] || []).filter(x => x.id !== id); return {};
});
