
// 將這 3 條換成你的「發布到網路 → CSV」連結
const CSV = {
  article: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtFcnN6Sx_TfSZUOd-z4pJAsdUH9Iwif5O0g511UlRdSj-k3pVMoQJHtYLQhcxOJkpS-BZu0PrI755/pub?output=csv",
  file:    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRLAWjFV-pv0-Ek3rsR6ITrYwLERjn6gDJES1VfevOZijiFkK4QOIw23gpm4gbJgLm1a6jfxpVFw2L/pub?gid=0&single=true&output=csv",
  daily:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5FAscCEiiTPtwoRATyaWkoibduHw-R46MQAemT32oYDB2tp9zzHh3-uErkSt62dqEEwYcFooC3oyg/pub?gid=0&single=true&output=csv"
};

let cache={article:[],file:[],daily:[]},active='article',pageSize=100,shownCount=0,currentFiltered=[],selectedWorks=new Set();
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
$('#tabArticle').onclick=async()=>{setTab('article');await loadList('article')};
$('#tabFile').onclick=async()=>{setTab('file');await loadList('file')};
$('#tabDaily').onclick=async()=>{setTab('daily');await loadList('daily')};
$('#refresh').onclick=async()=>{await loadList(active,true)};
const backBtn = document.querySelector('#backBottom'); if(backBtn) backBtn.onclick=()=>{showList()};

// 書籤
const BM_KEY='reader_bookmark_map';
const getBM=()=>{ try{ return JSON.parse(localStorage.getItem(BM_KEY)||'{}'); }catch(e){ return {}; } };
const saveBM=(k,y)=>{ const m=getBM(); m[k]=y; localStorage.setItem(BM_KEY, JSON.stringify(m)); };
const readBM=k=>getBM()[k];
$('#bookmark').onclick=()=>{ saveBM($('#rTitle').textContent, window.scrollY||0); toast('已加書籤'); $('#bmFloat').classList.remove('hidden'); };
$('#bmFloat').onclick=()=>{ const y=readBM($('#rTitle').textContent); if(y!=null) window.scrollTo(0,y); };

// 字級
const FONT_KEY='reader_font_size', MAP={s:'16px', m:'20px', l:'24px'};
function applyFont(c){ document.documentElement.style.setProperty('--fz', MAP[c]||MAP.m);
  for(const b of $$('.segBtn')) b.setAttribute('aria-pressed','false');
  const btn=document.querySelector('.segBtn[data-size="'+c+'"]'); if(btn) btn.setAttribute('aria-pressed','true');
  localStorage.setItem(FONT_KEY, c);
}
for(const b of $$('.segBtn')) b.addEventListener('click', ()=>applyFont(b.dataset.size));
applyFont(localStorage.getItem(FONT_KEY)||'m');

function setTab(k){
  active=k;
  for(const b of $$('nav button')) b.setAttribute('aria-pressed','false');
  (k==='article'?$('#tabArticle'):k==='file'?$('#tabFile'):$('#tabDaily')).setAttribute('aria-pressed','true');
  showList();
}
function showList(){ $('#reader').classList.add('hidden'); $('#listPanel').classList.remove('hidden'); $('#toolbar').classList.remove('hidden'); window.scrollTo(0,0); }
function showReader(){ $('#reader').classList.remove('hidden'); $('#listPanel').classList.add('hidden'); $('#toolbar').classList.add('hidden'); window.scrollTo(0,0); }

// CSV parser
function parseCSV(t){
  const rows=[]; let cur=[],v='',q=false;
  for(let i=0;i<t.length;i++){
    const c=t[i];
    if(c=='"'){ if(q && t[i+1]=='"'){ v+='"'; i++; } else { q=!q; } }
    else if(c==',' && !q){ cur.push(v); v=''; }
    else if((c=='\n'||c=='\r') && !q){ if(v!==''||cur.length>0){ cur.push(v); rows.push(cur); cur=[]; v=''; } }
    else v+=c;
  }
  if(v!==''||cur.length>0) cur.push(v);
  if(cur.length>0) rows.push(cur);
  return rows;
}
async function fetchCSV(u){
  const r=await fetch(u,{cache:'no-store'});
  const t=await r.text();
  const rows=parseCSV(t);
  const body= rows[0] && /日期|date|Date/.test(rows[0][0]) ? rows.slice(1) : rows;
  return body.map(c=>({date:c[0]||'',category:c[1]||'',title:c[2]||'',content:c[3]||''}))
             .filter(x=>(x.title.trim()!==''||x.content.trim()!==''));
}
async function loadList(k){
  try{
    const u = k==='article'?CSV.article:k==='file'?CSV.file:CSV.daily;
    const d = await fetchCSV(u);
    cache[k]=d;
    buildChips(d);
    renderList(k,d);
  }catch(e){ console.error(e); renderEmpty('讀取失敗'); }
}
function buildChips(a){
  const wrap=$('#workChips');
  const keep=new Set(selectedWorks);
  const works=Array.from(new Set(a.map(x=>(x.category||'').trim()).filter(Boolean))).sort();
  wrap.innerHTML='<button class="chip active" data-val="">全部</button>'+works.map(w=>'<button class="chip" data-val="'+w+'">'+w+'</button>').join('');
  selectedWorks=keep;
  wrap.querySelectorAll('.chip').forEach(ch=>{
    ch.addEventListener('click',()=>{
      const v=ch.getAttribute('data-val');
      if(v===''){ selectedWorks.clear(); wrap.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); ch.classList.add('active'); }
      else {
        wrap.querySelector('.chip[data-val=""]').classList.remove('active');
        if(selectedWorks.has(v)) selectedWorks.delete(v); else selectedWorks.add(v);
        ch.classList.toggle('active');
        if(selectedWorks.size===0) wrap.querySelector('.chip[data-val=""]').classList.add('active');
      }
      renderList(active, cache[active]);
    });
    const vv=ch.getAttribute('data-val');
    if(vv!=='' && selectedWorks.has(vv)) ch.classList.add('active');
  });
  if(selectedWorks.size===0) wrap.querySelector('.chip[data-val=""]').classList.add('active');
}
function renderEmpty(m){ const ul=$('#list'); ul.innerHTML='<li class="meta">'+(m||'目前沒有內容或搜尋不到。')+'</li>'; $('#loadMoreBox').classList.add('hidden'); }
function renderList(k,arr){
  const ul=$('#list'); ul.textContent='';
  let d=arr||[];
  if(selectedWorks.size>0) d=d.filter(x=>selectedWorks.has((x.category||'').trim()));
  const q=($('#q').value||'').toLowerCase().trim();
  if(!q && d.length>1500) return renderEmpty('資料量較大，請先搜尋（至少輸入 2 個字）');
  if(q.length>0){ if(q.length<2) return renderEmpty('請至少輸入 2 個字再搜尋'); d=d.filter(x=>(x.title+x.category+x.content).toLowerCase().includes(q)); }
  currentFiltered=d; shownCount=0; renderMore();
}
function renderMore(){
  const ul=$('#list'); const end=Math.min(currentFiltered.length, shownCount+pageSize);
  if(shownCount===0 && currentFiltered.length===0) return renderEmpty();
  const batch=20; let i=shownCount;
  function pump(){
    const stop=Math.min(end,i+batch);
    for(; i<stop; i++){
      const x=currentFiltered[i];
      const li=document.createElement('li'); li.className='card';
      const title=x.title && x.title.trim()!=='' ? x.title : '(無標題)';
      const cat=(x.category||'').trim();
      const meta=[x.date, cat?('・'+cat):''].join('');
      li.innerHTML='<h3>'+title+'</h3><div class="meta">'+meta+'</div>';
      li.onclick=()=>openReader(x);
      ul.appendChild(li);
    }
    if(i<end) requestAnimationFrame(pump);
    else { shownCount=end; if(shownCount<currentFiltered.length) $('#loadMoreBox').classList.remove('hidden'); else $('#loadMoreBox').classList.add('hidden'); }
  }
  pump();
}
function openReader(x){
  const title=x.title&&x.title.trim()!==''?x.title:'(無標題)';
  $('#rTitle').textContent=title;
  $('#rMeta').textContent=x.date;
  const el=$('#rContent'); el.textContent='';
  progressiveRender(x.content||'');
  showReader();
  const y=readBM(title);
  $('#bmFloat').classList.toggle('hidden', !(y!=null));
}
async function progressiveRender(t){
  const el=$('#rContent'); const bar=$('#progress'); const fill=$('#progress span');
  bar.classList.remove('hidden');
  const chunk=2000, total=t.length; let shown=0;
  while(shown<total){
    const nx=t.slice(shown, shown+chunk);
    el.append(document.createTextNode(nx));
    shown += nx.length;
    fill.style.width = Math.min(100, Math.round((shown/total)*100))+'%';
    await new Promise(r=>requestAnimationFrame(r));
  }
  bar.classList.add('hidden');
}
// 右滑返回（閱讀畫面）
let sx=0, sy=0, tracking=false; const EDGE=90, TH=35, MAXDY=80;
document.addEventListener('touchstart', e=>{
  if($('#reader').classList.contains('hidden')) return;
  if(e.touches.length!==1) return;
  const t=e.touches[0]; sx=t.clientX; sy=t.clientY; tracking=(sx<=EDGE);
}, {passive:true});
document.addEventListener('touchmove', e=>{
  if(!tracking) return;
  const t=e.touches[0]; const dx=t.clientX-sx; const dy=t.clientY-sy;
  if(Math.abs(dy)>MAXDY) return;
  if(dx>TH){ tracking=false; showList(); }
}, {passive:true});
document.addEventListener('touchend', ()=>{ tracking=false; }, {passive:true});
// Toast
let tt=null;
function toast(msg){
  let t=document.querySelector('#toast');
  if(!t){
    t=document.createElement('div'); t.id='toast';
    t.style.position='fixed'; t.style.bottom='24px'; t.style.left='50%'; t.style.transform='translateX(-50%)';
    t.style.background='rgba(0,0,0,.7)'; t.style.color='#fff'; t.style.padding='8px 12px'; t.style.borderRadius='999px';
    t.style.fontSize='14px'; t.style.zIndex='9999';
    document.body.appendChild(t);
  }
  t.textContent=msg; t.style.opacity='1';
  clearTimeout(tt); tt=setTimeout(()=> t.style.opacity='0', 1200);
}
setTab('article'); loadList('article');

// === Theme Injector: paper / eyecare-light / eyecare-dark ===
(function(){
  const KEY='theme3';
  const ORDER=['theme-paper','theme-eyeL','theme-eyeD'];
  function apply(cls){
    document.body.classList.remove('theme-paper','theme-eyeL','theme-eyeD');
    if(cls) document.body.classList.add(cls);
    try{ localStorage.setItem(KEY, cls||''); }catch(e){}
  }
  function load(){ try{return localStorage.getItem(KEY)||'';}catch(e){return '';} }
  apply(load());

  function ensureUI(){
    if(document.querySelector('.theme-btn')) return;
    const btn=document.createElement('button');
    btn.className='theme-btn'; btn.type='button'; btn.setAttribute('aria-label','切換主題'); btn.textContent='🌙';
    document.body.appendChild(btn);
    const menu=document.createElement('div'); menu.className='theme-menu';
    menu.innerHTML=`<a class="theme-dot paper"  title="紙質"        data-v="theme-paper"></a>
                    <a class="theme-dot eyeL"   title="護眼(亮)"    data-v="theme-eyeL"></a>
                    <a class="theme-dot eyeD"   title="護眼(夜)"    data-v="theme-eyeD"></a>`;
    document.body.appendChild(menu);
    let pressTimer=null, menuOpen=false;
    const cycle=()=>{ const cur=load(); const idx=Math.max(0, ORDER.indexOf(cur)); const next=ORDER[(idx+1)%ORDER.length]; apply(next); toast(next); };
    const openMenu=()=>{ menu.classList.add('show'); menuOpen=true; };
    const closeMenu=()=>{ menu.classList.remove('show'); menuOpen=false; };
    btn.addEventListener('touchstart', e=>{ pressTimer=setTimeout(openMenu,600); }, {passive:true});
    btn.addEventListener('touchend',   e=>{ if(pressTimer){clearTimeout(pressTimer); if(!menuOpen) cycle();} }, {passive:true});
    btn.addEventListener('click', e=>{ if(!menuOpen) cycle(); });
    menu.addEventListener('click', e=>{ const v=e.target?.getAttribute?.('data-v'); if(!v) return; apply(v); closeMenu(); toast(v); });
    document.addEventListener('click', e=>{ if(menuOpen && !menu.contains(e.target) && e.target!==btn) closeMenu(); });
  }
  function toast(v){
    const map={ 'theme-paper':'紙質', 'theme-eyeL':'護眼（亮）', 'theme-eyeD':'護眼（夜）' };
    const t=document.createElement('div');
    t.textContent='已切換為：'+(map[v]||'');
    Object.assign(t.style,{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(env(safe-area-inset-bottom,0px) + 24px)',background:'#0f1113',color:'#fff',padding:'10px 14px',borderRadius:'12px',border:'1px solid #1e2227',fontSize:'14px',zIndex:10001,opacity:'0',transition:'opacity .2s ease'});
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.style.opacity='1'); setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),200); }, 1200);
  }
  if(document.readyState!=='loading') ensureUI(); else document.addEventListener('DOMContentLoaded', ensureUI);
})();

