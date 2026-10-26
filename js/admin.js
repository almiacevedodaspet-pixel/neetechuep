const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const F={
 title:['Título','text',1],author:['Autor / grupo','text'],course:['Curso','text'],category:['Categoría / área','text'],date:['Fecha','date'],duration:['Duración (ej. 18 min)','text'],
 summary:['Resumen','textarea',1],description:['Descripción','textarea',1],link:['Enlace de Google Drive','url',1],cover:['Portada (enlace Drive de imagen, opcional)','url',1]};
const T={articles:{n:'Artículo',f:['title','author','course','category','date','link','summary']},
 podcasts:{n:'Podcast',f:['title','author','course','category','date','duration','link','description']},
 comics:{n:'Cómic',f:['title','author','course','date','link','cover','description']}};
let tab='articles',DATA={},editId=null;
const api=async(m,u,b)=>{const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});const j=await r.json().catch(()=>null);if(!j)throw new Error('El servidor respondió '+r.status+' sin datos válidos: las Functions (carpeta functions) no están activas en este despliegue.');if(!r.ok)throw new Error(j.error||('Error '+r.status));return j};
function form(d={}){
 $('#ft').textContent=(editId?'Editar ':'Nuevo ')+T[tab].n.toLowerCase();
 $('#form').innerHTML=T[tab].f.map(k=>{const [l,t,full]=F[k];const v=esc(d[k]||'');
  const inp=t==='textarea'?`<textarea id="f_${k}">${v}</textarea>`:`<input id="f_${k}" type="${t}" value="${v}">`;
  return `<div class="${full?'full':''}"><label>${l}</label>${inp}</div>`}).join('');
 $('#cancel').style.display=editId?'':'none';$('#fe').textContent='';
}
async function load(){DATA=await (await fetch('/api/content')).json();list()}
function list(){
 const a=DATA[tab]||[];
 $('#items').innerHTML=a.length?a.map(i=>`<div class="item"><div><strong>${esc(i.title)}</strong><br><small>${esc(i.author)} · ${esc(i.date||'')}</small></div><div><button class="btn s g" data-e="${i.id}">Editar</button> <button class="btn s" style="background:#C0262D;border-color:#C0262D" data-d="${i.id}">Eliminar</button></div></div>`).join(''):'<p class="empty">Sin elementos.</p>';
}
function setTab(t){tab=t;editId=null;document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));form();list()}
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-t]');if(t)setTab(t.dataset.t);
 const ed=e.target.closest('[data-e]');if(ed){editId=ed.dataset.e;form(DATA[tab].find(x=>x.id===editId));scrollTo({top:0,behavior:'smooth'})}
 const de=e.target.closest('[data-d]');if(de&&confirm('¿Eliminar este elemento?')){try{await api('DELETE',`/api/admin/items?type=${tab}&id=${de.dataset.d}`);await load()}catch(x){alert(x.message)}}
});
$('#cancel').onclick=()=>{editId=null;form()};
$('#save').onclick=async()=>{
 const data={};T[tab].f.forEach(k=>data[k]=$('#f_'+k).value);
 try{editId?await api('PUT','/api/admin/items',{type:tab,id:editId,data}):await api('POST','/api/admin/items',{type:tab,data});
  editId=null;form();await load();$('#fe').innerHTML='<span class="ok">Guardado correctamente ✔</span>'}catch(x){$('#fe').textContent=x.message}
};
async function login(){try{await api('POST','/api/login',{user:$('#u').value,pass:$('#p').value});start()}catch(x){$('#le').textContent=x.message}}
$('#lb').onclick=login;$('#p').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
$('#out').onclick=async()=>{await api('DELETE','/api/login');location.reload()};
async function start(){$('#login').style.display='none';$('#panel').style.display='block';setTab('articles');await load()}
(async()=>{try{const r=await api('GET','/api/login');r.authed?start():$('#login').style.display='block'}catch{$('#login').style.display='block'}})();

// ---- Importar desde Excel
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
const COL={titulo:'title',autor:'author',curso:'course',categoria:'category',fecha:'date',resumen:'summary',descripcion:'description',duracion:'duration',enlace:'link',portada:'cover'};
let XDATA=null;
const dstr=v=>{if(v instanceof Date){const d=new Date(v.getTime()+12*3600e3);return d.toISOString().slice(0,10)}return String(v??'').trim()};
$('#xf').onchange=e=>{
 const f=e.target.files[0];XDATA=null;$('#xb').disabled=true;$('#xe').textContent='';if(!f)return;
 if(typeof XLSX==='undefined'){$('#xe').textContent='No se pudo cargar el lector de Excel (revisa tu conexión).';return}
 const rd=new FileReader();
 rd.onload=()=>{try{
  const wb=XLSX.read(new Uint8Array(rd.result),{type:'array',cellDates:true});const out={};
  wb.SheetNames.forEach(n=>{const k=norm(n);const type=k.startsWith('articul')?'articles':k.startsWith('podcast')?'podcasts':k.startsWith('comic')?'comics':null;if(!type)return;
   const rows=XLSX.utils.sheet_to_json(wb.Sheets[n],{defval:'',raw:true});
   out[type]=(out[type]||[]).concat(rows.map(r=>{const o={};Object.keys(r).forEach(h=>{const c=COL[norm(h)];if(c)o[c]=dstr(r[h])});return o}).filter(o=>o.title||o.author));});
  const names={articles:'Artículos',podcasts:'Podcasts',comics:'Cómics'};
  const parts=Object.keys(out).map(t=>`${names[t]}: ${out[t].length} filas`);
  if(!parts.length){$('#xp').textContent='';$('#xe').textContent='No se encontraron hojas llamadas Articulos, Podcasts o Comics.';return}
  XDATA=out;$('#xp').textContent='Listo para importar → '+parts.join(' · ');$('#xb').disabled=false;
 }catch(x){$('#xe').textContent='No se pudo leer el archivo: '+x.message}};
 rd.readAsArrayBuffer(f);
};
$('#xb').onclick=async()=>{
 if(!XDATA)return;$('#xb').disabled=true;$('#xe').className='err';$('#xe').textContent='Importando…';
 try{const r=await api('POST','/api/admin/import',{...XDATA,replace:$('#xr').checked});
  const a=r.added,n=Object.values(a).reduce((x,y)=>x+y,0);
  $('#xe').className='err ok';$('#xe').textContent=`Importados ${n} elementos`+(r.skipped?` · ${r.skipped} repetidos omitidos`:'')+(r.errors.length?` · ${r.errors.length} filas con error: ${r.errors.join(' | ')}`:'');
  $('#xf').value='';XDATA=null;$('#xp').textContent='';await load();
 }catch(x){$('#xe').className='err';$('#xe').textContent=x.message;$('#xb').disabled=false}
};
