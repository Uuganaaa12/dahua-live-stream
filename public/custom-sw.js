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
    console.log('SW: Configs loaded');
  } catch (err) {
    console.error('SW: Config load failed', err);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Шинэ SW-ийг шууд суулгах
  event.waitUntil(loadCameraConfigs());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Бүх цонхыг шууд хяналтандаа авах
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/cgi-bin/mjpg/video.cgi')) {
    const url = new URL(event.request.url);
    const ip = url.hostname;
    const authHeader = cameraAuthMap[ip];

    if (authHeader) {
      // Шинээр Headers объект үүсгэж Authorization нэмэх
      const newHeaders = new Headers(event.request.headers);
      newHeaders.set('Authorization', `Basic ${authHeader}`);

      const modifiedRequest = new Request(event.request, {
        headers: newHeaders,
        mode: 'cors', // Камер өөр IP дээр байгаа тул cors байх ёстой
        credentials: 'omit', // Хөтөчийн өөрийн cache-лагдсан login-г ашиглахгүй
      });

      event.respondWith(
        fetch(modifiedRequest).catch((err) => {
          console.error('Fetch failed, trying without auth:', err);
          return fetch(event.request);
        }),
      );
    }
  }
});
