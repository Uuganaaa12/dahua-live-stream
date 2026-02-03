// src/custom-sw.js
importScripts('./ngsw-worker.js');

// Камеруудын нэвтрэх мэдээлэл (IP-ээр нь ялгана)
const cameraAuthMap = {
  '192.168.1.201': 'admin:admin123',
  '192.168.1.200': 'admin:admin123',
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Зөвхөн камерын MJPG хүсэлтүүдийг барьж авах
  if (url.pathname.includes('/cgi-bin/mjpg/video.cgi')) {
    const ip = url.hostname;
    const credentials = cameraAuthMap[ip];

    if (credentials) {
      const authHeader = 'Basic ' + btoa(credentials);

      const modifiedRequest = new Request(event.request, {
        headers: {
          ...event.request.headers,
          Authorization: authHeader,
        },
        mode: 'cors',
      });

      event.respondWith(fetch(modifiedRequest).catch(() => fetch(event.request)));
    }
  }
});
