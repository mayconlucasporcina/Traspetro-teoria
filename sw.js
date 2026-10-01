const V='2026-10-01-v6-clickfix',S='shell-'+V,C='content-'+V;
const SHELL=["/", "/index.html", "/styles.css", "/app.js", "/offline.html", "/manifest.webmanifest", "/edital.json", "/search-index.json", "/icon-192.png", "/icon-512.png"];
self.addEventListener('install',e=>e.waitUntil(caches.open(S).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![S,C].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function networkFirst(req){
  try{const r=await fetch(req,{cache:'no-store'});if(r.ok)(await caches.open(C)).put(req,r.clone());return r;}
  catch{return await caches.match(req)||await caches.match('/offline.html');}
}
async function stale(req){
  const c=await caches.open(C),old=await c.match(req);
  const p=fetch(req).then(r=>{if(r.ok)c.put(req,r.clone());return r;}).catch(()=>null);
  return old||await p||await caches.match('/offline.html');
}
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(networkFirst(r));return;}
 if(r.destination==='script'||r.destination==='style'){e.respondWith(networkFirst(r));return;}
 if(r.destination==='image'||u.pathname.endsWith('.json'))e.respondWith(stale(r));
});
