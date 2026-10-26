const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dId=u=>{const m=String(u||'').match(/\/d\/([\w-]+)|[?&]id=([\w-]+)|\/folders\/([\w-]+)/);return m&&(m[1]||m[2]||m[3])};
const prev=u=>dId(u)?`https://drive.google.com/file/d/${dId(u)}/preview`:u;
const thumb=u=>dId(u)?`https://drive.google.com/thumbnail?id=${dId(u)}&sz=w800`:'';
const fmt=d=>{const t=new Date(d+'T12:00:00');return isNaN(t)?esc(d||''):t.toLocaleDateString('es-PY',{day:'numeric',month:'long',year:'numeric'})};
const by=(a,b)=>String(b.date||'').localeCompare(String(a.date||''));
let DATA={articles:[],podcasts:[],comics:[]};
function openModal(title,url){$('#mt').textContent=title;$('#mf').src=prev(url);$('#mo').href=url;$('#modal').classList.add('open')}
function closeModal(){$('#modal').classList.remove('open');$('#mf').src='about:blank'}
function bars(){return Array.from({length:34},(_,i)=>`<i style="height:${20+Math.abs(Math.sin(i*1.7)*70)}%"></i>`).join('')}
function render(){
 const A=[...(DATA.articles||[])].sort(by),P=[...(DATA.podcasts||[])].sort(by),C=[...(DATA.comics||[])].sort(by);
 $('#list-a').innerHTML=A.length?A.map((a,i)=>`<article class="card"><span class="chip">${esc(a.category||'Artículo')}</span><h3>${esc(a.title)}</h3><div class="meta"><b>${esc(a.author)}</b>${a.course?' · '+esc(a.course):''} · ${fmt(a.date)}</div><p>${esc(a.summary)}</p><div class="row">${a.link?`<button class="btn s b" data-k="a" data-i="${i}">Leer artículo</button>`:'<span class="meta">Documento próximamente</span>'}</div></article>`).join(''):'<p class="empty">Aún no hay artículos publicados.</p>';
 $('#list-p').innerHTML=P.length?P.map((p,i)=>`<article class="card"><span class="chip">${esc(p.category||'Podcast')}</span><h3>${esc(p.title)}</h3><div class="meta"><b>${esc(p.author)}</b>${p.course?' · '+esc(p.course):''} · ${fmt(p.date)}${p.duration?' · '+esc(p.duration):''}</div><div class="pod"><button class="play" ${p.link?`data-k="p" data-i="${i}"`:'disabled'} aria-label="Escuchar">▶</button><div class="wave" style="flex:1">${bars()}</div></div><p>${esc(p.description)}</p><div class="row">${p.link?`<a class="btn s g" href="${esc(p.link)}" target="_blank" rel="noopener">Abrir en Drive</a>`:'<span class="meta">Audio próximamente</span>'}</div></article>`).join(''):'<p class="empty">Aún no hay podcasts publicados.</p>';
 $('#list-c').innerHTML=C.length?C.map((c,i)=>`<article class="card"><div class="cover" style="${c.cover?`background-image:url('${esc(thumb(c.cover))}')`:''}">${c.cover?'':'💬'}</div><h3>${esc(c.title)}</h3><div class="meta"><b>${esc(c.author)}</b>${c.course?' · '+esc(c.course):''} · ${fmt(c.date)}</div><p>${esc(c.description)}</p><div class="row">${c.link?`<button class="btn s b" data-k="c" data-i="${i}">Leer cómic</button>`:'<span class="meta">Próximamente</span>'}</div></article>`).join(''):'<p class="empty">Aún no hay cómics publicados.</p>';
 window._L={a:A,p:P,c:C};
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-k]');if(b){const it=window._L[b.dataset.k][b.dataset.i];openModal(it.title,it.link)}
 if(e.target.id==='modal'||e.target.id==='mc')closeModal();
 if(e.target.closest('#tg'))$('#menu').classList.toggle('open');
 if(e.target.closest('#menu a'))$('#menu').classList.remove('open');
});
document.addEventListener('keydown',e=>e.key==='Escape'&&closeModal());
(async()=>{
 try{const r=await fetch('/api/content');if(!r.ok)throw 0;DATA=await r.json()}
 catch{try{DATA=await (await fetch('/data/seed.json')).json()}catch{}}
 render();
})();
const secs=[...document.querySelectorAll('main section[id]')],links=[...document.querySelectorAll('#menu a')];
addEventListener('scroll',()=>{let c=secs[0].id;secs.forEach(s=>{if(scrollY>=s.offsetTop-120)c=s.id});links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+c))});
