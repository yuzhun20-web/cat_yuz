
(function(){
  const listEl=document.querySelector('.list');const articleEl=document.querySelector('.article');const headerTitle=document.querySelector('.brand');
  const data=[
    {"id":"1","title":"至尊無賴 第一章【小雷和神棍叔叔】","date":"2025/09/18","tag":"小說","content":"從天而降的福氣，往往還會伴隨著飛來的橫禍。——小雷語錄。"},
    {"id":"2","title":"至尊無賴 第二章【又不是扒你內褲！】（上）","date":"2025/09/19","tag":"小說","content":"吃了林姍姍做的價值兩千塊的早飯，小雷口裡咬著半個燒餅，極為不爽的跑下了樓開店鋪。"},
    {"id":"3","title":"至尊無賴 第四章【小小神棍】","date":"2025/09/19","tag":"小說","content":"這年頭，就算是出來騙人，也是要講包裝滴！"}
  ];
  function showList(){headerTitle.textContent='浪人閱讀';listEl.innerHTML=data.map(x=>`<div class="card" data-id="${x.id}"><h3>${x.title}</h3><time>${x.date} · ${x.tag}</time></div>`).join('');listEl.style.display='block';articleEl.style.display='none';document.body.classList.remove('paper-bg');}
  function showArticle(id){const it=data.find(x=>x.id===id);if(!it) return;headerTitle.textContent=it.title;articleEl.innerHTML=`<h1>${it.title}</h1><p>${it.content}</p>`;listEl.style.display='none';articleEl.style.display='block';if(document.body.classList.contains('paper')){document.body.classList.add('paper-bg');}window.scrollTo({top:0,behavior:'instant'});}
  document.addEventListener('click',(e)=>{const card=e.target.closest('.card');if(card){showArticle(card.getAttribute('data-id'));}});
  window.addEventListener('DOMContentLoaded',()=>{showList();if(window.RoninSettings) window.RoninSettings.init();if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js');}});
  document.querySelector('.brand').addEventListener('click',showList);
})();
