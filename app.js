const K='transpetro2026.progress.v3';
const T='transpetro2026.theme';
const F='transpetro2026.font';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

function readProgress(){
  try{return JSON.parse(localStorage.getItem(K))||{};}catch{return {};}
}
function setFont(delta=0){
  let v=parseInt(localStorage.getItem(F)||'16',10);
  v=Math.max(14,Math.min(22,v+delta));
  localStorage.setItem(F,String(v));
  document.documentElement.style.setProperty('--fs',v+'px');
}
function applyPrefs(){
  document.documentElement.dataset.colorTheme=localStorage.getItem(T)||'dark';
  setFont(0);
}
function updateProgress(){
  const p=readProgress();
  const all=[...document.querySelectorAll('[data-topic-id]')];
  if(!all.length)return;
  const ids=[...new Set(all.map(x=>x.dataset.topicId).filter(Boolean))];
  const done=ids.filter(id=>p[id]?.status==='completed').length;
  const pc=ids.length?Math.round(done/ids.length*100):0;
  document.querySelectorAll('[data-progress-bar]').forEach(x=>x.style.width=pc+'%');
  document.querySelectorAll('[data-progress-label]').forEach(x=>x.textContent=pc+'%');
  document.querySelectorAll('[data-done-count]').forEach(x=>x.textContent=done);
}
async function initSearch(){
  const inp=document.querySelector('[data-search]');
  const box=document.querySelector('[data-search-results]');
  if(!inp||!box)return;
  let data=[];
  try{data=await fetch('/search-index.json',{cache:'no-store'}).then(r=>r.json());}catch{}
  inp.addEventListener('input',()=>{
    const q=inp.value.trim().toLowerCase();
    if(q.length<2){box.hidden=true;box.innerHTML='';return;}
    const rows=data.filter(x=>(x.title+' '+x.block+' '+(x.keywords||'')).toLowerCase().includes(q)).slice(0,12);
    box.innerHTML=rows.map(x=>`<a href="${x.url}"><strong>${x.title}</strong><br><small>${x.block}</small></a>`).join('')||'<div style="padding:.8rem">Nenhum tópico encontrado.</div>';
    box.hidden=false;
  });
}
function updateNetwork(){
  document.querySelectorAll('[data-network]').forEach(x=>{
    x.textContent=navigator.onLine?'Online':'Offline — conteúdo salvo';
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  applyPrefs();
  updateProgress();
  initSearch();
  updateNetwork();

  document.querySelectorAll('button[data-theme]').forEach(btn=>{
    btn.addEventListener('click', ev=>{
      ev.preventDefault();
      ev.stopPropagation();
      const next=document.documentElement.dataset.colorTheme==='dark'?'light':'dark';
      document.documentElement.dataset.colorTheme=next;
      localStorage.setItem(T,next);
    });
  });

  document.querySelectorAll('[data-font-plus]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setFont(1);}));
  document.querySelectorAll('[data-font-minus]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setFont(-1);}));
  document.querySelectorAll('[data-menu]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();document.querySelector('.sidebar')?.classList.toggle('open');}));

  document.querySelectorAll('[data-complete]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=document.body.dataset.topicId;
      if(!id)return;
      const p=readProgress();
      p[id]={status:'completed',updatedAt:new Date().toISOString()};
      localStorage.setItem(K,JSON.stringify(p));
      btn.classList.add('done');
      btn.textContent='Concluído ✓';
      updateProgress();
    });
  });

  const id=document.body.dataset.topicId;
  if(id && readProgress()[id]?.status==='completed'){
    const b=document.querySelector('[data-complete]');
    if(b){b.classList.add('done');b.textContent='Concluído ✓';}
  }
});

window.addEventListener('online',updateNetwork);
window.addEventListener('offline',updateNetwork);

let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredPrompt=e;
  document.querySelectorAll('[data-install]').forEach(b=>b.hidden=false);
});
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-install]');
  if(b && deferredPrompt){
    await deferredPrompt.prompt();
    deferredPrompt=null;
  }
});
