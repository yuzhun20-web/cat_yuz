
(function(){
  const $=(s)=>document.querySelector(s);const prefsKey='reader.prefs';const d=document;
  function load(){try{return Object.assign({theme:'dark',fs:18},JSON.parse(localStorage.getItem(prefsKey)||'{}'));}catch(e){return {theme:'dark',fs:18};}}
  function save(p){localStorage.setItem(prefsKey,JSON.stringify(p));}
  function applyTheme(t){d.body.classList.remove('dark','eyecare','lightgray','paper');d.body.classList.add(t);}
  function setFS(px){const v=Math.max(14,Math.min(28,Number(px)||18));document.documentElement.style.setProperty('--fs',v+'px');const val=$('#rFsVal');if(val) val.textContent=v+'px';const p=load();p.fs=v;save(p);}
  function openSheet(){$('.r-sheet').classList.add('show');}function closeSheet(){$('.r-sheet').classList.remove('show');}
  window.RoninSettings={init(){const p=load();applyTheme(p.theme);setFS(p.fs);
      $('#themeDark')?.addEventListener('click',()=>{applyTheme('dark');const q=load();q.theme='dark';save(q);});
      $('#themeEye')?.addEventListener('click',()=>{applyTheme('eyecare');const q=load();q.theme='eyecare';save(q);});
      $('#themeGray')?.addEventListener('click',()=>{applyTheme('lightgray');const q=load();q.theme='lightgray';save(q);});
      $('#themePaper')?.addEventListener('click',()=>{applyTheme('paper');const q=load();q.theme='paper';save(q);});
      $('#rFsMinus')?.addEventListener('click',()=>setFS(load().fs-1));
      $('#rFsPlus')?.addEventListener('click',()=>setFS(load().fs+1));
      $('#sheetDone')?.addEventListener('click',closeSheet);
      $('#btnSettings')?.addEventListener('click',openSheet);
  }};
})();
