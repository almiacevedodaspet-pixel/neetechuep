export const FIELDS = {
  articles: ['title', 'author', 'course', 'category', 'date', 'summary', 'link'],
  podcasts: ['title', 'author', 'course', 'category', 'date', 'duration', 'description', 'link'],
  comics: ['title', 'author', 'course', 'date', 'description', 'link', 'cover']
};
export const clean = (type, d) => {
  const o = {};
  for (const f of FIELDS[type]) o[f] = String(d[f] ?? '').trim().slice(0, f === 'summary' || f === 'description' ? 700 : 300);
  if (!o.title || !o.author) throw new Error('Título y autor son obligatorios');
  for (const f of ['link', 'cover']) if (o[f] && !/^https:\/\//i.test(o[f])) throw new Error('Los enlaces deben comenzar con https://');
  return o;
};
