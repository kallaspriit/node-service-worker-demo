/* eslint-disable */
var version = '1.1.0';
var cacheName = 'cache-' + version;
var cachedResources = [
	'/',
	'/app.css',
	'/app.js'
];
var expectedCaches = [
	cacheName
];

self.oninstall = function(event) {
	var startTime = Date.now();

	console.log('installing');

	self.skipWaiting();

	event.waitUntil(
		caches.open(cacheName)
			.then(function(cache) {
				console.log('cache opened, adding files', cachedResources);

				return cache.addAll(cachedResources);
			}).then(function() {
				var timeTaken = Date.now() - startTime;

				console.log('installed in ' + timeTaken + 'ms');
			})
	);
};

self.onactivate = function(event) {
	if (self.clients && clients.claim) {
		clients.claim();
	}

	// remove caches beginning "trains-" that aren't in
	// expectedCaches
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			console.log('available caches', cacheNames);

			return Promise.all(
				cacheNames.map(function (cacheName) {
					if (expectedCaches.indexOf(cacheName) == -1) {
						console.log('delete cache', cacheName);

						return caches.delete(cacheName);
					}
				})
			);
		})
	);
};

self.onfetch = function (event) {
	var requestURL = new URL(event.request.url);

	console.log('searching from cache', requestURL.href);

	event.respondWith(
		caches.match(event.request, {
			ignoreVary: true
		}).then(function(response) {
			if (response) {
				console.log('cache hit', response);

				return response;
			}

			console.log('cache miss');

			return fetch(event.request);
		})
	);
};