/*global UVServiceWorker,__uv$config*/
/*
 * ghost proxy uv sw
 * custom sw wrapper to make it load instantly and fallback nicely
 */
importScripts('uv.bundle.js');
importScripts('uv.config.js');
importScripts(__uv$config.sw || 'uv.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

async function handleRequest(event) {
  if (uv.route(event)) {
    return await uv.fetch(event);
  }
  // only fetch same origin directly. block external stuff so they dont escape proxying.
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    return await fetch(event.request);
  }
  return new Response('Blocked non-proxied cross-origin request', {
    status: 470,
    statusText: 'Proxy Required',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

self.addEventListener('fetch', (event) => {
  // let ai requests go thru directly so cors doesnt break
  const url = new URL(event.request.url);
  if (url.hostname === 'api.edisonlearningcenter.me') return;

  event.respondWith(handleRequest(event));
});

