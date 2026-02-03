importScripts('./ngsw-worker.js');

let cameraAuthMap = {};

async function loadCameraConfigs() {
  try {
    const response = await fetch('cameras.json');
    const cameras = await response.json();
    cameraAuthMap = cameras.reduce((map, cam) => {
      map[cam.ip] = btoa(`${cam.user}:${cam.pass}`);
      return map;
    }, {});
    console.log('SW: Camera configs loaded');
  } catch (err) {
    console.error('SW: Load failed', err);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(loadCameraConfigs());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/cgi-bin/mjpg/video.cgi')) {
    const ip = url.hostname;
    const authHeader = cameraAuthMap[ip];

    if (authHeader) {
      const modifiedRequest = new Request(event.request, {
        headers: {
          ...event.request.headers,
          Authorization: `Basic ${authHeader}`,
        },
        mode: 'cors',
      });
      event.respondWith(fetch(modifiedRequest));
    }
  }
});
