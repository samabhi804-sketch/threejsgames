const CACHE_NAME = '3dsl-v2';
const ASSETS = [
	'./',
	'./index.html',
	'./styles.css',
	'./app.js'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	event.respondWith(
		caches.match(req).then((cached) => {
			if (cached) return cached;
			return fetch(req)
				.then((res) => {
					const copy = res.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
					return res;
				})
				.catch(() => caches.match('./index.html'));
		})
	);
});
