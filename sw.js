const CACHE='relay-v35';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==MAPC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* repeater map: the map library and map tiles get their own cache, capped, so viewed areas work offline without filling the phone */
const MAPC='relay-map',MAPHOST=/(^|\.)openfreemap\.org$|^unpkg\.com$/,MAXT=2500;let nput=0;
function trim(c){if(nput++%50)return;c.keys().then(k=>{if(k.length>MAXT)return Promise.all(k.slice(0,k.length-MAXT).map(r=>c.delete(r)))})}
function mapFetch(req,u){return caches.open(MAPC).then(c=>{const net=()=>fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){c.put(req,res.clone());trim(c)}return res});
  return u.pathname.startsWith('/styles/')?net().catch(()=>c.match(req)):c.match(req).then(h=>h||net())})}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.url.includes('relay-probe'))return;
  const u=new URL(e.request.url);if(MAPHOST.test(u.hostname)){e.respondWith(mapFetch(e.request,u));return}
  if(u.origin!==self.location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match('./index.html'))))});
