// SUABE 2 Service Worker - Offline Cache & PWA Support
const CACHE_NAME = 'suabe2-cache-v1';

// Calculate base path from location of sw.js
const swPath = self.location.pathname;
const basePath = swPath.substring(0, swPath.lastIndexOf('/') + 1);

const PRECACHE_URLS = [
    basePath,
    basePath + 'index.html',
    basePath + 'releases.json',
    basePath + 'dev/suabe2_dev.html',
    basePath + 'dev/suabe2_loader_dev.html',
    basePath + 'dev/suabe2_loader_dev.svg',
    basePath + 'stable/suabe2.html',
    basePath + 'stable/image.svg',
    basePath + 'releases/suabe2.html',
    basePath + 'releases/suabe2_v2.0.html'
];

// Install: Precache core assets and activate immediately
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                PRECACHE_URLS.map(url => {
                    return fetch(url, { cache: 'reload' })
                        .then(response => {
                            if (response.ok) {
                                return cache.put(url, response);
                            }
                        })
                        .catch(err => {
                            console.warn('[SW] Precache skipped for:', url, err.message);
                        });
                })
            );
        })
    );
});

// Activate: Clean up old caches and take control
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Stale-While-Revalidate & Offline Navigation Fallback
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Only handle HTTP/HTTPS schemes
    if (!url.protocol.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Background network fetch to keep cache up to date if online
            const networkFetch = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(fetchErr => {
                // If offline and request is HTML navigation, fallback to stable build or cached pages
                if (event.request.mode === 'navigate') {
                    return caches.match(basePath + 'stable/suabe2.html')
                        .then(fallback => fallback || caches.match(basePath + 'index.html'))
                        .then(fallback => fallback || caches.match(basePath + 'dev/suabe2_loader_dev.html'))
                        .then(fallback => fallback || caches.match(basePath + 'dev/suabe2_dev.html'));
                }
                throw fetchErr;
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || networkFetch;
        })
    );
});

// Handle messages from client
self.addEventListener('message', event => {
    if (event.data) {
        if (event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
        } else if (event.data.type === 'PING') {
            if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({ type: 'PONG', version: CACHE_NAME });
            }
        }
    }
});
