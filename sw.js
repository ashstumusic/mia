const CACHE_NAME = 'mia-baker-v11';
const PRECACHE = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/favicon.png',
    '/favicon-32.png',
    '/favicon-180.png',
    '/img/site/hero-1920.webp',
    '/img/site/terrarium-i-527.webp',
    '/img/site/terrarium-ii-540.webp',
    '/img/site/terrarium-iii-532.webp',
    '/img/site/about-1-1280.webp',
    '/img/site/about-2-1400.webp'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            const fetched = fetch(e.request).then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => cached);

            return cached || fetched;
        })
    );
});
