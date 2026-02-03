
importScripts('./ngsw-worker.js');

const cameraAuthMap = {
  '192.168.1.201': 'admin:admin123',
  '192.168.1.200': 'admin:admin123',
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

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
