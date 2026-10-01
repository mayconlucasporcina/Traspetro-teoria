
const V='2026-10-01-v3',S='shell-'+V,C='content-'+V,I='images-'+V;
const SHELL=['/','/index.html','/styles.css','/app.js','/offline.html','/manifest.webmanifest','/data/edital.json','/data/search-index.json','/assets/icons/icon-192.png','/assets/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(S).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![S,C,I].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function netFirst(req){try{const r=await fetch(req);if(r.ok)(await caches.open(C)).put(req,r.clone());return r}catch{return await caches.match(req)||await caches.match('/offline.html')}}
async function swr(req){const c=await caches.open(C),old=await c.match(req);const p=fetch(req).then(r=>{if(r.ok)c.put(req,r.clone());return r}).catch(()=>null);return old||await p||await caches.match('/offline.html')}
async function img(req){const c=await caches.open(I),old=await c.match(req);if(old)return old;try{const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r}catch{return new Response('',{status:504})}}
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;if(r.mode==='navigate'){e.respondWith(netFirst(r));return}if(r.destination==='image'){e.respondWith(img(r));return}if(u.pathname.startsWith('/data/')||u.pathname.startsWith('/topicos/')||r.destination==='script'||r.destination==='style')e.respondWith(swr(r));});
